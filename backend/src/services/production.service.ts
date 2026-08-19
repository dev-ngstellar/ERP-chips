import prisma from '../config/db';
import { StockEngineService } from './stockEngine.service';
import { generateBatchNumber } from '../utils/generators';
import { ApiError } from '../utils/response';

export interface CreateProductionBatchInput {
  productId: string;
  plannedOutput: number;
  actualOutput: number;
  wastageQuantity?: number;
  productionDate?: string;
  notes?: string;
  consumptions: {
    rawMaterialId: string;
    quantityConsumed: number;
  }[];
}

export class ProductionService {
  static async getAllBatches() {
    return prisma.productionBatch.findMany({
      include: {
        product: true,
        createdBy: { select: { id: true, fullName: true } },
        consumptions: {
          include: { rawMaterial: true },
        },
      },
      orderBy: { productionDate: 'desc' },
    });
  }

  static async getBatchById(id: string) {
    const batch = await prisma.productionBatch.findUnique({
      where: { id },
      include: {
        product: true,
        createdBy: { select: { id: true, fullName: true } },
        consumptions: {
          include: { rawMaterial: true },
        },
        stockMovements: true,
      },
    });

    if (!batch) {
      throw new ApiError(404, 'Production batch not found');
    }

    return batch;
  }

  static async createBatch(input: CreateProductionBatchInput, userId: string) {
    if (!input.consumptions || input.consumptions.length === 0) {
      throw new ApiError(400, 'Production batch must consume at least one raw material');
    }

    if (input.actualOutput <= 0) {
      throw new ApiError(400, 'Actual output quantity must be greater than zero');
    }

    const batchNumber = await generateBatchNumber();

    return prisma.$transaction(async (tx) => {
      // 1. Create Production Batch record
      const batch = await tx.productionBatch.create({
        data: {
          batchNumber,
          productId: input.productId,
          plannedOutput: input.plannedOutput,
          actualOutput: input.actualOutput,
          wastageQuantity: input.wastageQuantity || 0,
          productionDate: input.productionDate ? new Date(input.productionDate) : new Date(),
          notes: input.notes,
          createdById: userId,
          consumptions: {
            create: input.consumptions.map((c) => ({
              rawMaterialId: c.rawMaterialId,
              quantityConsumed: c.quantityConsumed,
            })),
          },
        },
        include: {
          product: true,
          consumptions: {
            include: { rawMaterial: true },
          },
        },
      });

      // 2. Atomically process stock movements:
      // - Validate RM stock & deduct (STOCK_OUT)
      // - Credit Product stock (STOCK_IN)
      await StockEngineService.recordProductionBatchMovements(
        tx,
        batch.id,
        input.productId,
        input.actualOutput,
        input.consumptions,
        userId
      );

      return batch;
    });
  }
}
