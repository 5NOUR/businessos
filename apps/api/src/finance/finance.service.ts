import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getSummary(orgId: string, startDate?: string, endDate?: string) {
    const where: Prisma.IncomeWhereInput & Prisma.ExpenseWhereInput = {
      organizationId: orgId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [incomeSum, expenseSum] = await Promise.all([
      this.prisma.income.aggregate({ where, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);

    const totalIncome = Number(incomeSum._sum.amount || 0);
    const totalExpenses = Number(expenseSum._sum.amount || 0);
    const netProfit = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, netProfit };
  }
}
