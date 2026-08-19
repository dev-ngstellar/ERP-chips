export type UserRole = 'ADMIN' | 'PRODUCTION_STORE' | 'SALES';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RawMaterial {
  id: string;
  materialName: string;
  materialCode: string;
  category: string;
  unit: string;
  minStockLevel: number;
  currentStock: number;
  standardCost: number;
  isActive: boolean;
  isLowStock?: boolean;
  stockValue?: number;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  rawMaterialId: string;
  rawMaterial?: RawMaterial;
  quantity: number;
}

export interface Recipe {
  id: string;
  recipeName: string;
  productId: string;
  product?: Product;
  outputYield: number;
  notes?: string;
  isActive: boolean;
  items: RecipeItem[];
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  packSize: string;
  unit: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  isActive: boolean;
  isLowStock?: boolean;
  stockValue?: number;
  recipes?: Recipe[];
}

export interface Supplier {
  id: string;
  supplierName: string;
  contactPerson?: string;
  mobileNumber: string;
  gstNumber?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  customerName: string;
  customerType: 'DISTRIBUTOR' | 'RETAILER' | 'SUPERMARKET' | 'DIRECT_CUSTOMER';
  contactPerson?: string;
  mobileNumber: string;
  gstNumber?: string;
  address?: string;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplier: Supplier;
  purchaseDate: string;
  invoiceNumber?: string;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  createdById: string;
  createdBy: { id: string; fullName: string };
  items: PurchaseItem[];
}

export interface ProductionConsumption {
  id: string;
  productionBatchId: string;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  quantityConsumed: number;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productId: string;
  product: Product;
  plannedOutput: number;
  actualOutput: number;
  wastageQuantity: number;
  productionDate: string;
  notes?: string;
  createdById: string;
  createdBy: { id: string; fullName: string };
  consumptions: ProductionConsumption[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  saleDate: string;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  createdById: string;
  createdBy: { id: string; fullName: string };
  items: SaleItem[];
}

export interface StockMovement {
  id: string;
  movementDate: string;
  stockType: 'RAW_MATERIAL' | 'FINISHED_GOOD';
  movementType: 'STOCK_IN' | 'STOCK_OUT';
  referenceType: 'PURCHASE' | 'PRODUCTION_CONSUMPTION' | 'PRODUCTION_OUTPUT' | 'SALE' | 'MANUAL_ADJUSTMENT';
  rawMaterialId?: string;
  rawMaterial?: RawMaterial;
  productId?: string;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  balanceAfter: number;
  notes?: string;
  createdBy?: { id: string; fullName: string };
}

export interface Expense {
  id: string;
  expenseDate: string;
  category: string;
  title: string;
  amount: number;
  paymentMode: string;
  notes?: string;
  createdBy: { id: string; fullName: string };
}

export interface DashboardSummary {
  today: {
    salesAmount: number;
    salesCount: number;
    purchasesAmount: number;
    purchasesCount: number;
    producedPackets: number;
    batchesCount: number;
    expensesAmount: number;
    expensesCount: number;
  };
  businessSummary: {
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    estimatedProfit: number;
    totalBatches: number;
    totalProducedPackets: number;
  };
  inventorySummary: {
    rawMaterialsCount: number;
    lowStockRMCount: number;
    rmValuation: number;
    productsCount: number;
    lowStockFGCount: number;
    fgValuation: number;
    lowStockRM: { id: string; name: string; current: number; min: number; unit: string }[];
    lowStockFG: { id: string; name: string; current: number; min: number; unit: string }[];
  };
  recentMovements: StockMovement[];
}
