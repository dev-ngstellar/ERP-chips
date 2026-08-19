import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class ReportController {
  static async getPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await ReportService.getPurchaseReport(startDate, endDate);
      return sendSuccess(res, data, 'Purchase report generated');
    } catch (err) {
      next(err);
    }
  }

  static async getProduction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await ReportService.getProductionReport(startDate, endDate);
      return sendSuccess(res, data, 'Production report generated');
    } catch (err) {
      next(err);
    }
  }

  static async getRawStock(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getRawStockReport();
      return sendSuccess(res, data, 'Raw material stock ledger generated');
    } catch (err) {
      next(err);
    }
  }

  static async getFinishedStock(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getFinishedStockReport();
      return sendSuccess(res, data, 'Finished goods stock ledger generated');
    } catch (err) {
      next(err);
    }
  }

  static async getSales(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await ReportService.getSalesReport(startDate, endDate);
      return sendSuccess(res, data, 'Sales report generated');
    } catch (err) {
      next(err);
    }
  }
}
