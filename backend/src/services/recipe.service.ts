import prisma from '../config/db';
import { ApiError } from '../utils/response';

export interface CreateRecipeInput {
  productId: string;
  recipeName: string;
  outputYield: number;
  notes?: string;
  items: {
    rawMaterialId: string;
    quantity: number;
  }[];
}

export class RecipeService {
  static async getAllRecipes() {
    return prisma.recipe.findMany({
      include: {
        product: true,
        items: {
          include: { rawMaterial: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getRecipeByProduct(productId: string) {
    const recipe = await prisma.recipe.findFirst({
      where: { productId, isActive: true },
      include: {
        product: true,
        items: {
          include: { rawMaterial: true },
        },
      },
    });
    return recipe;
  }

  static async createRecipe(input: CreateRecipeInput) {
    if (!input.items || input.items.length === 0) {
      throw new ApiError(400, 'Recipe must include at least one raw material');
    }

    return prisma.$transaction(async (tx) => {
      // Deactivate old active recipes for this product
      await tx.recipe.updateMany({
        where: { productId: input.productId },
        data: { isActive: false },
      });

      return tx.recipe.create({
        data: {
          productId: input.productId,
          recipeName: input.recipeName,
          outputYield: input.outputYield,
          notes: input.notes,
          isActive: true,
          items: {
            create: input.items.map((i) => ({
              rawMaterialId: i.rawMaterialId,
              quantity: i.quantity,
            })),
          },
        },
        include: {
          product: true,
          items: {
            include: { rawMaterial: true },
          },
        },
      });
    });
  }
}
