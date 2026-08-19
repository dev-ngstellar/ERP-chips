import prisma from '../config/db';

export interface CreateExpenseInput {
  expenseDate?: string;
  category: string;
  title: string;
  amount: number;
  paymentMode?: string;
  notes?: string;
}

export class ExpenseService {
  static async getAllExpenses() {
    return prisma.expense.findMany({
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  static async createExpense(input: CreateExpenseInput, userId: string) {
    return prisma.expense.create({
      data: {
        expenseDate: input.expenseDate ? new Date(input.expenseDate) : new Date(),
        category: input.category,
        title: input.title,
        amount: input.amount,
        paymentMode: input.paymentMode || 'CASH',
        notes: input.notes,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }
}
