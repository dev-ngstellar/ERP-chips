import prisma from '../config/db';

export class InventoryService {
  static async getRawMaterialStock() {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: { materialName: 'asc' },
    });

    return materials.map((m) => ({
      ...m,
      isLowStock: m.currentStock <= m.minStockLevel,
      stockValue: Number((m.currentStock * m.standardCost).toFixed(2)),
    }));
  }

  static async getFinishedGoodsStock() {
    const products = await prisma.product.findMany({
      orderBy: { productName: 'asc' },
    });

    return products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockLevel,
      stockValue: Number((p.currentStock * p.sellingPrice).toFixed(2)),
    }));
  }

  static async getStockMovements(filters?: {
    stockType?: string;
    movementType?: string;
    referenceType?: string;
    rawMaterialId?: string;
    productId?: string;
  }) {
    const where: any = {};
    if (filters?.stockType) where.stockType = filters.stockType;
    if (filters?.movementType) where.movementType = filters.movementType;
    if (filters?.referenceType) where.referenceType = filters.referenceType;
    if (filters?.rawMaterialId) where.rawMaterialId = filters.rawMaterialId;
    if (filters?.productId) where.productId = filters.productId;

    return prisma.stockMovement.findMany({
      where,
      include: {
        rawMaterial: true,
        product: true,
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: { movementDate: 'desc' },
      take: 100,
    });
  }
}
