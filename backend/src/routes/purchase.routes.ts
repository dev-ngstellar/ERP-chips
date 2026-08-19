import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', PurchaseController.getAll);
router.get('/:id', PurchaseController.getById);
router.post('/', PurchaseController.create);

export default router;
