import { Router } from 'express';
import { ProductionController } from '../controllers/production.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ProductionController.getAll);
router.get('/:id', ProductionController.getById);
router.post('/', ProductionController.create);

export default router;
