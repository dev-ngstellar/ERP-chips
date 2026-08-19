import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/purchases', ReportController.getPurchases);
router.get('/production', ReportController.getProduction);
router.get('/raw-stock', ReportController.getRawStock);
router.get('/finished-stock', ReportController.getFinishedStock);
router.get('/sales', ReportController.getSales);

export default router;
