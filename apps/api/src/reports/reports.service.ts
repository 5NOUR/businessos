import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryReportDto } from "./dto/query-report.dto";

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(orgId: string, dto: QueryReportDto) {
    const { startDate, endDate } = dto;
    const dateFilter: any = {};

    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    switch (dto.type) {
      case "sales":
        return this.getSalesReport(orgId, dateFilter);
      case "revenue":
        return this.getRevenueReport(orgId, dateFilter);
      case "expenses":
        return this.getExpensesReport(orgId, dateFilter);
      case "inventory":
        return this.getInventoryReport(orgId);
      case "customers":
        return this.getCustomersReport(orgId, dateFilter);
      case "employees":
        return this.getEmployeesReport(orgId);
      default:
        throw new BadRequestException("Unknown report type");
    }
  }

  private async getSalesReport(orgId: string, dateFilter: any) {
    const orders = await this.prisma.order.findMany({
      where: {
        organizationId: orgId,
        createdAt: dateFilter,
      },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      type: "sales",
      data: orders.map((order) => ({
        orderNumber: order.orderNumber,
        customer: order.customer?.name || "Unknown",
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        items: order.items.length,
      })),
    };
  }

  private async getRevenueReport(orgId: string, dateFilter: any) {
    const incomes = await this.prisma.income.findMany({
      where: { organizationId: orgId, date: dateFilter },
      orderBy: { date: "desc" },
    });

    const total = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

    return {
      type: "revenue",
      total,
      data: incomes.map((inc) => ({
        category: inc.category,
        description: inc.description,
        amount: Number(inc.amount),
        date: inc.date,
      })),
    };
  }

  private async getExpensesReport(orgId: string, dateFilter: any) {
    const expenses = await this.prisma.expense.findMany({
      where: { organizationId: orgId, date: dateFilter },
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return {
      type: "expenses",
      total,
      data: expenses.map((exp) => ({
        category: exp.category,
        description: exp.description,
        amount: Number(exp.amount),
        date: exp.date,
      })),
    };
  }

  private async getInventoryReport(orgId: string) {
    const products = await this.prisma.product.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { currentStock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
        sellingPrice: true,
        costPrice: true,
      },
    });

    return {
      type: "inventory",
      data: products,
    };
  }

  private async getCustomersReport(orgId: string, dateFilter: any) {
    const customers = await this.prisma.customer.findMany({
      where: { organizationId: orgId, deletedAt: null, createdAt: dateFilter },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true, invoices: true } },
      },
    });

    return {
      type: "customers",
      data: customers,
    };
  }

  private async getEmployeesReport(orgId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { organizationId: orgId },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    return {
      type: "employees",
      data: employees.map((emp) => ({
        name: emp.member?.user?.name || "Unknown",
        email: emp.member?.user?.email || "",
        position: emp.position,
        department: emp.department,
        salary: Number(emp.salary || 0),
        attendanceCount: emp.attendance.length,
      })),
    };
  }

  async exportCsv(orgId: string, dto: QueryReportDto): Promise<string> {
    const report = await this.generateReport(orgId, dto);
    const data = report.data;
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row: any) =>
        headers.map((header) => `"${row[header] ?? ""}"`).join(","),
      ),
    ];
    return csvRows.join("\n");
  }
}
