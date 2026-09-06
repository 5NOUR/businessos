import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { QueryIncomesDto } from "./dto/query-incomes.dto";
import { Prisma, PaymentMethod } from "@prisma/client";

@Injectable()
export class IncomesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        ...dto,
        organizationId: orgId,
        createdById: userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        paymentMethod: dto.paymentMethod as PaymentMethod | null | undefined,
      },
    });
  }

  async findAll(orgId: string, query: QueryIncomesDto) {
    const { search, category, startDate, endDate } = query;
    const sortBy = query.sortBy || "date";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.IncomeWhereInput = {
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

    const orderBy: Prisma.IncomeOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.IncomeOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.income.count({ where }),
      this.prisma.income.findMany({
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
    const income = await this.prisma.income.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!income) throw new NotFoundException("Income not found");
    return income;
  }

  async remove(orgId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!income) throw new NotFoundException("Income not found");
    return this.prisma.income.delete({ where: { id } });
  }
}
