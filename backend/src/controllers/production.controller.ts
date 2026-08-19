import { Response, NextFunction } from 'express';
import { ProductionService } from '../services/production.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class ProductionController {
  static async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProductionService.getAllBatches();
      return sendSuccess(res, data, 'Production batches retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProductionService.getBatchById(req.params.id);
      return sendSuccess(res, data, 'Production batch details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProductionService.createBatch(req.body, req.user!.id);
      return sendSuccess(
        res,
        data,
        'Production batch completed. Raw materials consumed and finished goods updated.',
        201
      );
    } catch (err) {
      next(err);
    }
  }
}
