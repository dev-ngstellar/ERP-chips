import prisma from '../config/db';
import { ApiError } from '../utils/response';

export class MastersService {
  // --- Raw Materials ---
  static async getRawMaterials() {
    return prisma.rawMaterial.findMany({
      orderBy: { materialName: 'asc' },
    });
  }

  static async createRawMaterial(data: {
    materialName: string;
    materialCode: string;
    category: string;
    unit: string;
    minStockLevel?: number;
    standardCost?: number;
  }) {
    const existing = await prisma.rawMaterial.findUnique({
      where: { materialCode: data.materialCode.toUpperCase().trim() },
    });

    if (existing) {
      throw new ApiError(400, `Raw Material with code ${data.materialCode} already exists`);
    }

    return prisma.rawMaterial.create({
      data: {
        materialName: data.materialName,
        materialCode: data.materialCode.toUpperCase().trim(),
        category: data.category,
        unit: data.unit,
        minStockLevel: data.minStockLevel || 0,
        standardCost: data.standardCost || 0,
        currentStock: 0,
      },
    });
  }

  static async updateRawMaterial(id: string, data: Partial<{
    materialName: string;
    category: string;
    unit: string;
    minStockLevel: number;
    standardCost: number;
    isActive: boolean;
  }>) {
    return prisma.rawMaterial.update({
      where: { id },
      data,
    });
  }

  // --- Products ---
  static async getProducts() {
    return prisma.product.findMany({
      include: {
        recipes: {
          include: {
            items: {
              include: { rawMaterial: true },
            },
          },
        },
      },
      orderBy: { productName: 'asc' },
    });
  }

  static async createProduct(data: {
    productName: string;
    sku: string;
    category: string;
    packSize: string;
    unit?: string;
    sellingPrice: number;
    minStockLevel?: number;
  }) {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase().trim() },
    });

    if (existing) {
      throw new ApiError(400, `Product with SKU ${data.sku} already exists`);
    }

    return prisma.product.create({
      data: {
        productName: data.productName,
        sku: data.sku.toUpperCase().trim(),
        category: data.category,
        packSize: data.packSize,
        unit: data.unit || 'PACKET',
        sellingPrice: data.sellingPrice,
        minStockLevel: data.minStockLevel || 0,
        currentStock: 0,
      },
    });
  }

  static async updateProduct(id: string, data: Partial<{
    productName: string;
    category: string;
    packSize: string;
    unit: string;
    sellingPrice: number;
    minStockLevel: number;
    isActive: boolean;
  }>) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  // --- Suppliers ---
  static async getSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { supplierName: 'asc' },
    });
  }

  static async createSupplier(data: {
    supplierName: string;
    contactPerson?: string;
    mobileNumber: string;
    gstNumber?: string;
    address?: string;
    openingBalance?: number;
  }) {
    return prisma.supplier.create({
      data: {
        supplierName: data.supplierName,
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        gstNumber: data.gstNumber,
        address: data.address,
        openingBalance: data.openingBalance || 0,
        currentBalance: data.openingBalance || 0,
      },
    });
  }

  static async updateSupplier(id: string, data: any) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  // --- Customers ---
  static async getCustomers() {
    return prisma.customer.findMany({
      orderBy: { customerName: 'asc' },
    });
  }

  static async createCustomer(data: {
    customerName: string;
    customerType?: string;
    contactPerson?: string;
    mobileNumber: string;
    gstNumber?: string;
    address?: string;
    creditLimit?: number;
    openingBalance?: number;
  }) {
    return prisma.customer.create({
      data: {
        customerName: data.customerName,
        customerType: data.customerType || 'RETAILER',
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        gstNumber: data.gstNumber,
        address: data.address,
        creditLimit: data.creditLimit || 0,
        openingBalance: data.openingBalance || 0,
        currentBalance: data.openingBalance || 0,
      },
    });
  }

  static async updateCustomer(id: string, data: any) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }
}
