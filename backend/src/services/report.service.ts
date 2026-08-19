import prisma from '../config/db';

export class ReportService {
  static async getPurchaseReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) where.purchaseDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.purchaseDate.lte = end;
      }
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: { rawMaterial: true },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    const flattened = purchases.flatMap((p) =>
      p.items.map((item) => ({
        purchaseId: p.id,
        purchaseNumber: p.purchaseNumber,
        purchaseDate: p.purchaseDate,
        supplierName: p.supplier.supplierName,
        materialName: item.rawMaterial.materialName,
        materialCode: item.rawMaterial.materialCode,
        quantity: item.quantity,
        unit: item.rawMaterial.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }))
    );

    return flattened;
  }

  static async getProductionReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.productionDate = {};
      if (startDate) where.productionDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.productionDate.lte = end;
      }
    }

    const batches = await prisma.productionBatch.findMany({
      where,
      include: {
        product: true,
        consumptions: {
          include: { rawMaterial: true },
        },
      },
      orderBy: { productionDate: 'desc' },
    });

    return batches.map((b) => ({
      batchId: b.id,
      batchNumber: b.batchNumber,
      productionDate: b.productionDate,
      productName: b.product.productName,
      sku: b.product.sku,
      plannedOutput: b.plannedOutput,
      actualOutput: b.actualOutput,
      wastageQuantity: b.wastageQuantity,
      unit: b.product.unit,
      consumptions: b.consumptions.map((c) => ({
        materialName: c.rawMaterial.materialName,
        quantityConsumed: c.quantityConsumed,
        unit: c.rawMaterial.unit,
      })),
    }));
  }

  static async getRawStockReport() {
    const materials = await prisma.rawMaterial.findMany({
      include: {
        stockMovements: true,
      },
      orderBy: { materialName: 'asc' },
    });

    return materials.map((m) => {
      const inwarded = m.stockMovements
        .filter((sm) => sm.movementType === 'STOCK_IN')
        .reduce((sum, sm) => sum + sm.quantity, 0);

      const consumed = m.stockMovements
        .filter((sm) => sm.movementType === 'STOCK_OUT')
        .reduce((sum, sm) => sum + sm.quantity, 0);

      return {
        id: m.id,
        materialName: m.materialName,
        materialCode: m.materialCode,
        category: m.category,
        unit: m.unit,
        inwarded,
        consumed,
        balance: m.currentStock,
        minStockLevel: m.minStockLevel,
        standardCost: m.standardCost,
        valuation: Number((m.currentStock * m.standardCost).toFixed(2)),
      };
    });
  }

  static async getFinishedStockReport() {
    const products = await prisma.product.findMany({
      include: {
        stockMovements: true,
      },
      orderBy: { productName: 'asc' },
    });

    return products.map((p) => {
      const produced = p.stockMovements
        .filter((sm) => sm.movementType === 'STOCK_IN')
        .reduce((sum, sm) => sum + sm.quantity, 0);

      const sold = p.stockMovements
        .filter((sm) => sm.movementType === 'STOCK_OUT')
        .reduce((sum, sm) => sum + sm.quantity, 0);

      return {
        id: p.id,
        productName: p.productName,
        sku: p.sku,
        category: p.category,
        packSize: p.packSize,
        unit: p.unit,
        produced,
        sold,
        balance: p.currentStock,
        minStockLevel: p.minStockLevel,
        sellingPrice: p.sellingPrice,
        valuation: Number((p.currentStock * p.sellingPrice).toFixed(2)),
      };
    });
  }

  static async getSalesReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.saleDate.lte = end;
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { saleDate: 'desc' },
    });

    const flattened = sales.flatMap((s) =>
      s.items.map((item) => ({
        saleId: s.id,
        invoiceNumber: s.invoiceNumber,
        saleDate: s.saleDate,
        customerName: s.customer.customerName,
        customerType: s.customer.customerType,
        productName: item.product.productName,
        sku: item.product.sku,
        quantity: item.quantity,
        unit: item.product.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }))
    );

    return flattened;
  }
}
