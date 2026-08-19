import { Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';

export class ExpenseController {
  static async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ExpenseService.getAllExpenses();
      return sendSuccess(res, data, 'Expenses retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ExpenseService.createExpense(req.body, req.user!.id);
      return sendSuccess(res, data, 'Expense recorded successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
