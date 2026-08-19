import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Chips & Snacks ERP database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.productionConsumption.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@chips.com',
      passwordHash: passwordHash,
      fullName: 'Vikram Mehta (Owner/Admin)',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const storeUser = await prisma.user.create({
    data: {
      email: 'store@chips.com',
      passwordHash: staffPassword,
      fullName: 'Ramesh Patel (Store/Production)',
      role: 'PRODUCTION_STORE',
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@chips.com',
      passwordHash: staffPassword,
      fullName: 'Pooja Sharma (Sales/Billing)',
      role: 'SALES',
      isActive: true,
    },
  });

  console.log('✅ Users seeded:', [admin.email, storeUser.email, salesUser.email]);

  // 3. Seed Raw Materials
  const rmPotatoes = await prisma.rawMaterial.create({
    data: {
      materialName: 'Fresh Chip-Grade Potatoes (Lady Rosetta)',
      materialCode: 'RM-POT-01',
      category: 'Agro Products',
      unit: 'KG',
      minStockLevel: 25,
      currentStock: 0, // Starts at 0 for clear demo purchase flow
      standardCost: 30.0,
      isActive: true,
    },
  });

  const rmOil = await prisma.rawMaterial.create({
    data: {
      materialName: 'Refined Palmolein Cooking Oil',
      materialCode: 'RM-OIL-01',
      category: 'Oils & Fats',
      unit: 'LITER',
      minStockLevel: 10,
      currentStock: 0,
      standardCost: 120.0,
      isActive: true,
    },
  });

  const rmSalt = await prisma.rawMaterial.create({
    data: {
      materialName: 'Fine Iodized Salt',
      materialCode: 'RM-SLT-01',
      category: 'Spices & Seasoning',
      unit: 'KG',
      minStockLevel: 5,
      currentStock: 0,
      standardCost: 20.0,
      isActive: true,
    },
  });

  const rmMasala = await prisma.rawMaterial.create({
    data: {
      materialName: 'Signature Spicy Masala Seasoning',
      materialCode: 'RM-MSL-01',
      category: 'Spices & Seasoning',
      unit: 'KG',
      minStockLevel: 5,
      currentStock: 0,
      standardCost: 150.0,
      isActive: true,
    },
  });

  const rmPouch = await prisma.rawMaterial.create({
    data: {
      materialName: 'Printed Nitrogen Pouch 100g (Metallic)',
      materialCode: 'RM-PCH-100',
      category: 'Packaging Material',
      unit: 'NOS',
      minStockLevel: 100,
      currentStock: 0,
      standardCost: 2.0,
      isActive: true,
    },
  });

  console.log('✅ Raw Materials seeded');

  // 4. Seed Products
  const prodClassic = await prisma.product.create({
    data: {
      productName: 'Classic Salted Potato Chips 100g',
      sku: 'FG-CHP-SLT-100',
      category: 'Potato Chips',
      packSize: '100g',
      unit: 'PACKET',
      sellingPrice: 30.0,
      currentStock: 0,
      minStockLevel: 50,
      isActive: true,
    },
  });

  const prodMasala = await prisma.product.create({
    data: {
      productName: 'Spicy Masala Potato Chips 100g',
      sku: 'FG-CHP-MSL-100',
      category: 'Potato Chips',
      packSize: '100g',
      unit: 'PACKET',
      sellingPrice: 30.0,
      currentStock: 0,
      minStockLevel: 50,
      isActive: true,
    },
  });

  console.log('✅ Finished Products seeded');

  // 5. Seed Suppliers
  await prisma.supplier.create({
    data: {
      supplierName: 'Agro Fresh Farms Pvt Ltd',
      contactPerson: 'Harish Kumar',
      mobileNumber: '+91 98765 43210',
      gstNumber: '27AABCA1234F1Z5',
      address: 'Plot 42, Mandi Agro Market, Nashik, MH',
      openingBalance: 0,
    },
  });

  await prisma.supplier.create({
    data: {
      supplierName: 'Krishna Edible Oils Corp',
      contactPerson: 'Sunil Gupta',
      mobileNumber: '+91 98220 11223',
      gstNumber: '27BBBCK9876M1Z2',
      address: 'Industrial Estate, Phase II, Pune, MH',
      openingBalance: 0,
    },
  });

  await prisma.supplier.create({
    data: {
      supplierName: 'SafePack Flexible Packaging Ltd',
      contactPerson: 'Anita Rao',
      mobileNumber: '+91 97654 33445',
      gstNumber: '27CCCPK5544R1Z9',
      address: 'Print City, GIDC, Vapi, GJ',
      openingBalance: 0,
    },
  });

  console.log('✅ Suppliers seeded');

  // 6. Seed Customers
  await prisma.customer.create({
    data: {
      customerName: 'ABC Supermarket Mart',
      customerType: 'SUPERMARKET',
      contactPerson: 'Manoj Verma',
      mobileNumber: '+91 99112 23344',
      gstNumber: '27DDDCU8899P1Z8',
      address: 'High Street Galleria, Mumbai, MH',
      creditLimit: 50000,
      openingBalance: 0,
    },
  });

  await prisma.customer.create({
    data: {
      customerName: 'Metro Snacks Distributors',
      customerType: 'DISTRIBUTOR',
      contactPerson: 'Rajesh Shah',
      mobileNumber: '+91 98877 66554',
      gstNumber: '27EEEDU7766K1Z1',
      address: 'Wholesale Ring Road, Thane, MH',
      creditLimit: 100000,
      openingBalance: 0,
    },
  });

  await prisma.customer.create({
    data: {
      customerName: 'QuickBite Retail Stores',
      customerType: 'RETAILER',
      contactPerson: 'Sanjay Deshmukh',
      mobileNumber: '+91 97766 55443',
      address: 'Station Road, Kalyan, MH',
      creditLimit: 20000,
      openingBalance: 0,
    },
  });

  console.log('✅ Customers seeded');

  // 7. Seed Standard Recipes (BOM)
  // Recipe for Classic Salted 100g (Yield = 180 packets)
  const recipeClassic = await prisma.recipe.create({
    data: {
      recipeName: 'Classic Salted 100g Batch Standard (180 pkts yield)',
      productId: prodClassic.id,
      outputYield: 180,
      notes: 'Standard 50kg batch formula for crisp golden salted chips',
      items: {
        create: [
          { rawMaterialId: rmPotatoes.id, quantity: 50.0 }, // 50 Kg potatoes
          { rawMaterialId: rmOil.id, quantity: 10.0 },      // 10 L oil
          { rawMaterialId: rmSalt.id, quantity: 2.0 },      // 2 Kg salt
          { rawMaterialId: rmPouch.id, quantity: 200.0 },   // 200 pouches (allowing for 20 wastage)
        ],
      },
    },
  });

  // Recipe for Spicy Masala 100g (Yield = 180 packets)
  const recipeMasala = await prisma.recipe.create({
    data: {
      recipeName: 'Spicy Masala 100g Batch Standard (180 pkts yield)',
      productId: prodMasala.id,
      outputYield: 180,
      notes: 'Standard 50kg batch formula with chili spice seasoning',
      items: {
        create: [
          { rawMaterialId: rmPotatoes.id, quantity: 50.0 },
          { rawMaterialId: rmOil.id, quantity: 10.0 },
          { rawMaterialId: rmSalt.id, quantity: 1.0 },
          { rawMaterialId: rmMasala.id, quantity: 1.5 },
          { rawMaterialId: rmPouch.id, quantity: 200.0 },
        ],
      },
    },
  });

  console.log('✅ Standard Recipes/BOM seeded:', [recipeClassic.recipeName, recipeMasala.recipeName]);

  // 8. Seed Sample Expenses
  await prisma.expense.create({
    data: {
      expenseDate: new Date(),
      category: 'ELECTRICITY_POWER',
      title: 'Factory Power & Frying Plant Units',
      amount: 1200.0,
      paymentMode: 'BANK_TRANSFER',
      notes: 'Weekly commercial electricity billing',
      createdById: admin.id,
    },
  });

  await prisma.expense.create({
    data: {
      expenseDate: new Date(),
      category: 'FUEL_GAS',
      title: 'LPG Commercial Gas Cylinders (2 Nos)',
      amount: 3400.0,
      paymentMode: 'UPI',
      notes: 'Continuous frying gas refuels',
      createdById: admin.id,
    },
  });

  console.log('🎉 Seeding complete! Database is ready for demo flows.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
