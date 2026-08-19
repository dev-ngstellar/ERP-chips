import { Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class SaleController {
  static async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SaleService.getAllSales();
      return sendSuccess(res, data, 'Sales invoices retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SaleService.getSaleById(String(req.params.id));
      return sendSuccess(res, data, 'Sale invoice details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SaleService.createSale(req.body, req.user!.id);
      return sendSuccess(
        res,
        data,
        'Sale invoice generated and finished goods deducted successfully',
        201
      );
    } catch (err) {
      next(err);
    }
  }
}
