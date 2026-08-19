import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/raw-materials', InventoryController.getRawMaterialStock);
router.get('/finished-goods', InventoryController.getFinishedGoodsStock);
router.get('/movements', InventoryController.getStockMovements);

export default router;
