import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getSummary(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardSummary();
      return sendSuccess(res, data, 'Dashboard KPIs and summary retrieved');
    } catch (err) {
      next(err);
    }
  }
}
