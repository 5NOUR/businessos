import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { QueryExpensesDto } from "./dto/query-expenses.dto";
import { Prisma, PaymentMethod } from "@prisma/client";

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        ...dto,
        organizationId: orgId,
        createdById: userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        paymentMethod: dto.paymentMethod as PaymentMethod | null | undefined,
      },
    });
  }

  async findAll(orgId: string, query: QueryExpensesDto) {
    const { search, category, startDate, endDate } = query;
    const sortBy = query.sortBy || "date";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.ExpenseWhereInput = {
      organizationId: orgId,
    };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.ExpenseOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!expense) throw new NotFoundException("Expense not found");
    return expense;
  }

  async remove(orgId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!expense) throw new NotFoundException("Expense not found");
    return this.prisma.expense.delete({ where: { id } });
  }
}
