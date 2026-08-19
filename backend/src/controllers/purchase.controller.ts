import { Response, NextFunction } from 'express';
import { PurchaseService } from '../services/purchase.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class PurchaseController {
  static async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await PurchaseService.getAllPurchases();
      return sendSuccess(res, data, 'Purchases retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await PurchaseService.getPurchaseById(String(req.params.id));
      return sendSuccess(res, data, 'Purchase details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await PurchaseService.createPurchase(req.body, req.user!.id);
      return sendSuccess(res, data, 'Purchase recorded and stock inwarded successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
