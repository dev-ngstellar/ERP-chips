import prisma from '../config/db';
import { StockEngineService } from './stockEngine.service';
import { generatePurchaseNumber } from '../utils/generators';
import { ApiError } from '../utils/response';

export interface CreatePurchaseInput {
  supplierId: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  paidAmount?: number;
  notes?: string;
  items: {
    rawMaterialId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class PurchaseService {
  static async getAllPurchases() {
    return prisma.purchase.findMany({
      include: {
        supplier: true,
        createdBy: { select: { id: true, fullName: true } },
        items: {
          include: { rawMaterial: true },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  static async getPurchaseById(id: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, fullName: true } },
        items: {
          include: { rawMaterial: true },
        },
        stockMovements: true,
      },
    });

    if (!purchase) {
      throw new ApiError(404, 'Purchase record not found');
    }

    return purchase;
  }

  static async createPurchase(input: CreatePurchaseInput, userId: string) {
    if (!input.items || input.items.length === 0) {
      throw new ApiError(400, 'Purchase must contain at least one item');
    }

    const purchaseNumber = await generatePurchaseNumber();

    // Calculate total amount
    const totalAmount = input.items.reduce((sum, item) => {
      return sum + Number((item.quantity * item.unitPrice).toFixed(2));
    }, 0);

    return prisma.$transaction(async (tx) => {
      // 1. Create Purchase header
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId: input.supplierId,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
          invoiceNumber: input.invoiceNumber,
          totalAmount,
          paidAmount: input.paidAmount || 0,
          notes: input.notes,
          createdById: userId,
          items: {
            create: input.items.map((i) => ({
              rawMaterialId: i.rawMaterialId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: Number((i.quantity * i.unitPrice).toFixed(2)),
            })),
          },
        },
        include: {
          items: true,
          supplier: true,
        },
      });

      // 2. Update Supplier balance
      const unpaidAmount = totalAmount - (input.paidAmount || 0);
      if (unpaidAmount > 0) {
        await tx.supplier.update({
          where: { id: input.supplierId },
          data: {
            currentBalance: {
              increment: unpaidAmount,
            },
          },
        });
      }

      // 3. Atomically Inward Stock via Stock Engine
      await StockEngineService.recordPurchaseInward(
        tx,
        purchase.id,
        input.items,
        userId
      );

      return purchase;
    });
  }
}
