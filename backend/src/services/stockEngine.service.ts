import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/response';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class StockEngineService {
  /**
   * Inward raw materials from a purchase order
   */
  static async recordPurchaseInward(
    tx: TransactionClient,
    purchaseId: string,
    items: { rawMaterialId: string; quantity: number; unitPrice: number }[],
    userId: string
  ) {
    for (const item of items) {
      const rm = await tx.rawMaterial.findUnique({
        where: { id: item.rawMaterialId },
      });

      if (!rm) {
        throw new ApiError(404, `Raw material with ID ${item.rawMaterialId} not found`);
      }

      const newStock = Number((rm.currentStock + item.quantity).toFixed(3));

      // Update current stock on master
      await tx.rawMaterial.update({
        where: { id: item.rawMaterialId },
        data: { currentStock: newStock },
      });

      // Write immutable double-entry movement log
      await tx.stockMovement.create({
        data: {
          stockType: 'RAW_MATERIAL',
          movementType: 'STOCK_IN',
          referenceType: 'PURCHASE',
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          balanceAfter: newStock,
          purchaseId: purchaseId,
          createdById: userId,
          notes: `Purchase Inward (${purchaseId}): +${item.quantity} ${rm.unit}`,
        },
      });
    }
  }

  /**
   * Process complete production batch:
   * 1. Validate all RM available
   * 2. Deduct consumed RM (STOCK_OUT)
   * 3. Add produced Finished Good (STOCK_IN)
   */
  static async recordProductionBatchMovements(
    tx: TransactionClient,
    batchId: string,
    productId: string,
    actualOutput: number,
    consumptions: { rawMaterialId: string; quantityConsumed: number }[],
    userId: string
  ) {
    // 1. Validate RM Stock availability
    for (const c of consumptions) {
      const rm = await tx.rawMaterial.findUnique({
        where: { id: c.rawMaterialId },
      });

      if (!rm) {
        throw new ApiError(404, `Raw material ID ${c.rawMaterialId} not found`);
      }

      if (rm.currentStock < c.quantityConsumed) {
        throw new ApiError(
          400,
          `Insufficient stock for '${rm.materialName}'. Available: ${rm.currentStock} ${rm.unit}, Required: ${c.quantityConsumed} ${rm.unit}`
        );
      }
    }

    // 2. Consume Raw Materials (STOCK_OUT)
    for (const c of consumptions) {
      const rm = (await tx.rawMaterial.findUnique({
        where: { id: c.rawMaterialId },
      }))!;

      const newStock = Number((rm.currentStock - c.quantityConsumed).toFixed(3));

      await tx.rawMaterial.update({
        where: { id: c.rawMaterialId },
        data: { currentStock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          stockType: 'RAW_MATERIAL',
          movementType: 'STOCK_OUT',
          referenceType: 'PRODUCTION_CONSUMPTION',
          rawMaterialId: c.rawMaterialId,
          quantity: c.quantityConsumed,
          balanceAfter: newStock,
          productionBatchId: batchId,
          createdById: userId,
          notes: `Production Consumption (Batch ${batchId}): -${c.quantityConsumed} ${rm.unit}`,
        },
      });
    }

    // 3. Increment Finished Good Stock (STOCK_IN)
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new ApiError(404, `Product ID ${productId} not found`);
    }

    const newProductStock = Number((product.currentStock + actualOutput).toFixed(3));

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: newProductStock },
    });

    await tx.stockMovement.create({
      data: {
        stockType: 'FINISHED_GOOD',
        movementType: 'STOCK_IN',
        referenceType: 'PRODUCTION_OUTPUT',
        productId: productId,
        quantity: actualOutput,
        unitPrice: product.sellingPrice,
        balanceAfter: newProductStock,
        productionBatchId: batchId,
        createdById: userId,
        notes: `Production Output (Batch ${batchId}): +${actualOutput} ${product.unit}`,
      },
    });
  }

  /**
   * Deduct finished goods for sales invoice (STOCK_OUT)
   */
  static async recordSaleOutward(
    tx: TransactionClient,
    saleId: string,
    items: { productId: string; quantity: number; unitPrice: number }[],
    userId: string
  ) {
    // 1. Validate FG availability
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`);
      }

      if (product.currentStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for '${product.productName}'. Available: ${product.currentStock} ${product.unit}, Required: ${item.quantity} ${product.unit}`
        );
      }
    }

    // 2. Deduct FG stock (STOCK_OUT)
    for (const item of items) {
      const product = (await tx.product.findUnique({
        where: { id: item.productId },
      }))!;

      const newStock = Number((product.currentStock - item.quantity).toFixed(3));

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          stockType: 'FINISHED_GOOD',
          movementType: 'STOCK_OUT',
          referenceType: 'SALE',
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          balanceAfter: newStock,
          saleId: saleId,
          createdById: userId,
          notes: `Sales Outward (Invoice ${saleId}): -${item.quantity} ${product.unit}`,
        },
      });
    }
  }
}
