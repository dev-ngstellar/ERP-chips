import prisma from '../config/db';
import { StockEngineService } from './stockEngine.service';
import { generateInvoiceNumber } from '../utils/generators';
import { ApiError } from '../utils/response';

export interface CreateSaleInput {
  customerId: string;
  saleDate?: string;
  paidAmount?: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class SaleService {
  static async getAllSales() {
    return prisma.sale.findMany({
      include: {
        customer: true,
        createdBy: { select: { id: true, fullName: true } },
        items: {
          include: { product: true },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  static async getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, fullName: true } },
        items: {
          include: { product: true },
        },
        stockMovements: true,
      },
    });

    if (!sale) {
      throw new ApiError(404, 'Sale invoice not found');
    }

    return sale;
  }

  static async createSale(input: CreateSaleInput, userId: string) {
    if (!input.items || input.items.length === 0) {
      throw new ApiError(400, 'Sale must contain at least one item');
    }

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate total amount
    const totalAmount = input.items.reduce((sum, item) => {
      return sum + Number((item.quantity * item.unitPrice).toFixed(2));
    }, 0);

    return prisma.$transaction(async (tx) => {
      // 1. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: input.customerId,
          saleDate: input.saleDate ? new Date(input.saleDate) : new Date(),
          totalAmount,
          paidAmount: input.paidAmount || 0,
          notes: input.notes,
          createdById: userId,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: Number((i.quantity * i.unitPrice).toFixed(2)),
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });

      // 2. Update Customer balance
      const unpaidAmount = totalAmount - (input.paidAmount || 0);
      if (unpaidAmount > 0) {
        await tx.customer.update({
          where: { id: input.customerId },
          data: {
            currentBalance: {
              increment: unpaidAmount,
            },
          },
        });
      }

      // 3. Atomically validate FG stock and execute STOCK_OUT
      await StockEngineService.recordSaleOutward(
        tx,
        sale.id,
        input.items,
        userId
      );

      return sale;
    });
  }
}
