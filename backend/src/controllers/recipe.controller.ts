import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';
import { sendSuccess } from '../utils/response';

export class RecipeController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RecipeService.getAllRecipes();
      return sendSuccess(res, data, 'Recipes retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RecipeService.getRecipeByProduct(req.params.productId);
      return sendSuccess(res, data, 'Product recipe retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RecipeService.createRecipe(req.body);
      return sendSuccess(res, data, 'Recipe saved successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
