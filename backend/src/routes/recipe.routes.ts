import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', RecipeController.getAll);
router.get('/by-product/:productId', RecipeController.getByProduct);
router.post('/', RecipeController.create);

export default router;
