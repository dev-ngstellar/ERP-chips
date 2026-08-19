import { Router } from 'express';
import authRoutes from './auth.routes';
import mastersRoutes from './masters.routes';
import purchaseRoutes from './purchase.routes';
import recipeRoutes from './recipe.routes';
import productionRoutes from './production.routes';
import saleRoutes from './sale.routes';
import inventoryRoutes from './inventory.routes';
import expenseRoutes from './expense.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/masters', mastersRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/recipes', recipeRoutes);
router.use('/production', productionRoutes);
router.use('/sales', saleRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;
