import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSummary(orgId: string) {
    const cacheKey = `dashboard:summary:${orgId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      revenueThisMonth,
      expensesThisMonth,
      revenueThisYear,
      expensesThisYear,
      ordersCount,
      customersCount,
      lowStockCount,
      pendingTasksCount,
    ] = await Promise.all([
      this.prisma.income.aggregate({
        where: { organizationId: orgId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { organizationId: orgId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.income.aggregate({
        where: { organizationId: orgId, date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { organizationId: orgId, date: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.order.count({ where: { organizationId: orgId } }),
      this.prisma.customer.count({ where: { organizationId: orgId } }),
      this.prisma.product.count({
        where: {
          organizationId: orgId,
          currentStock: { lte: this.prisma.product.fields.minimumStock },
        },
      }),
      this.prisma.task.count({
        where: {
          organizationId: orgId,
          status: { not: "DONE" },
        },
      }),
    ]);

    const revenueMonth = Number(revenueThisMonth._sum.amount || 0);
    const expensesMonth = Number(expensesThisMonth._sum.amount || 0);
    const revenueYear = Number(revenueThisYear._sum.amount || 0);
    const expensesYear = Number(expensesThisYear._sum.amount || 0);

    const summary = {
      revenueThisMonth: revenueMonth,
      expensesThisMonth: expensesMonth,
      profitThisMonth: revenueMonth - expensesMonth,
      revenueThisYear: revenueYear,
      expensesThisYear: expensesYear,
      profitThisYear: revenueYear - expensesYear,
      ordersCount,
      customersCount,
      lowStockCount,
      pendingTasksCount,
    };

    await this.cacheManager.set(cacheKey, summary, 60);
    return summary;
  }
  async getCharts(orgId: string, period: "week" | "month" | "year" = "month") {
    const cacheKey = `dashboard:charts:${orgId}:${period}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    let startDate: Date;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const incomes = await this.prisma.income.findMany({
      where: { organizationId: orgId, date: { gte: startDate } },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { organizationId: orgId, date: { gte: startDate } },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    });

    const formatDate = (date: Date) => {
      if (period === "year") {
        return date.toISOString().slice(0, 7);
      } else {
        return date.toISOString().slice(0, 10);
      }
    };

    const map = new Map<string, { revenue: number; expenses: number }>();

    for (const inc of incomes) {
      const key = formatDate(inc.date);
      const current = map.get(key) || { revenue: 0, expenses: 0 };
      current.revenue += Number(inc.amount);
      map.set(key, current);
    }

    for (const exp of expenses) {
      const key = formatDate(exp.date);
      const current = map.get(key) || { revenue: 0, expenses: 0 };
      current.expenses += Number(exp.amount);
      map.set(key, current);
    }

    const labels = Array.from(map.keys()).sort();
    const revenueData = labels.map((label) => ({
      label,
      value: map.get(label)!.revenue,
    }));
    const expenseData = labels.map((label) => ({
      label,
      value: map.get(label)!.expenses,
    }));

    const charts = { labels, revenueData, expenseData };

    await this.cacheManager.set(cacheKey, charts, 60);
    return charts;
  }

  async getRecentActivities(orgId: string, limit = 10) {
    const cacheKey = `dashboard:activities:${orgId}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { select: { name: true } } },
    });

    const activities = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata,
      actorName: log.actor?.name || "Unknown",
      createdAt: log.createdAt,
    }));

    await this.cacheManager.set(cacheKey, activities, 60);
    return activities;
  }
}
