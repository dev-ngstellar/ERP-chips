import { Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class InventoryController {
  static async getRawMaterialStock(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await InventoryService.getRawMaterialStock();
      return sendSuccess(res, data, 'Raw material stock balances retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getFinishedGoodsStock(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await InventoryService.getFinishedGoodsStock();
      return sendSuccess(res, data, 'Finished goods stock balances retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await InventoryService.getStockMovements(req.query as any);
      return sendSuccess(res, data, 'Stock movement audit trail retrieved');
    } catch (err) {
      next(err);
    }
  }
}
