import prisma from '../config/db';

export class DashboardService {
  static async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Today's Transactions
    const [todaySales, todayPurchases, todayProductions, todayExpenses] = await Promise.all([
      prisma.sale.findMany({
        where: { saleDate: { gte: today, lt: tomorrow } },
      }),
      prisma.purchase.findMany({
        where: { purchaseDate: { gte: today, lt: tomorrow } },
      }),
      prisma.productionBatch.findMany({
        where: { productionDate: { gte: today, lt: tomorrow } },
      }),
      prisma.expense.findMany({
        where: { expenseDate: { gte: today, lt: tomorrow } },
      }),
    ]);

    const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayPurchasesTotal = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const todayProducedPkts = todayProductions.reduce((sum, b) => sum + b.actualOutput, 0);
    const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 2. All-Time Totals for Profitability Estimate
    const [allSales, allPurchases, allExpenses, allProductions] = await Promise.all([
      prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { id: true } }),
      prisma.purchase.aggregate({ _sum: { totalAmount: true }, _count: { id: true } }),
      prisma.expense.aggregate({ _sum: { amount: true }, _count: { id: true } }),
      prisma.productionBatch.aggregate({ _sum: { actualOutput: true }, _count: { id: true } }),
    ]);

    const totalSalesValue = allSales._sum.totalAmount || 0;
    const totalPurchaseValue = allPurchases._sum.totalAmount || 0;
    const totalExpensesValue = allExpenses._sum.amount || 0;

    // Approximate estimated profit = Sales - (Purchases + Expenses) or Sales - Expenses
    const estimatedProfit = totalSalesValue - (totalPurchaseValue + totalExpensesValue);

    // 3. Stock Summary & Low Stock Warnings
    const [rawMaterials, products] = await Promise.all([
      prisma.rawMaterial.findMany(),
      prisma.product.findMany(),
    ]);

    const lowStockRawMaterials = rawMaterials.filter((rm) => rm.currentStock <= rm.minStockLevel);
    const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);

    const totalRawMaterialValuation = rawMaterials.reduce(
      (sum, rm) => sum + rm.currentStock * rm.standardCost,
      0
    );
    const totalFinishedGoodsValuation = products.reduce(
      (sum, p) => sum + p.currentStock * p.sellingPrice,
      0
    );

    // 4. Recent Activities
    const recentMovements = await prisma.stockMovement.findMany({
      take: 6,
      orderBy: { movementDate: 'desc' },
      include: {
        rawMaterial: true,
        product: true,
      },
    });

    return {
      today: {
        salesAmount: todaySalesTotal,
        salesCount: todaySales.length,
        purchasesAmount: todayPurchasesTotal,
        purchasesCount: todayPurchases.length,
        producedPackets: todayProducedPkts,
        batchesCount: todayProductions.length,
        expensesAmount: todayExpensesTotal,
        expensesCount: todayExpenses.length,
      },
      businessSummary: {
        totalSales: totalSalesValue,
        totalPurchases: totalPurchaseValue,
        totalExpenses: totalExpensesValue,
        estimatedProfit,
        totalBatches: allProductions._count.id || 0,
        totalProducedPackets: allProductions._sum.actualOutput || 0,
      },
      inventorySummary: {
        rawMaterialsCount: rawMaterials.length,
        lowStockRMCount: lowStockRawMaterials.length,
        rmValuation: Number(totalRawMaterialValuation.toFixed(2)),
        productsCount: products.length,
        lowStockFGCount: lowStockProducts.length,
        fgValuation: Number(totalFinishedGoodsValuation.toFixed(2)),
        lowStockRM: lowStockRawMaterials.map((m) => ({
          id: m.id,
          name: m.materialName,
          current: m.currentStock,
          min: m.minStockLevel,
          unit: m.unit,
        })),
        lowStockFG: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.productName,
          current: p.currentStock,
          min: p.minStockLevel,
          unit: p.unit,
        })),
      },
      recentMovements,
    };
  }
}
