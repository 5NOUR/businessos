import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        organizationId: orgId,
        createdById: userId,
      },
    });
  }

  async findAll(orgId: string, query: QueryCustomersDto) {
    const {
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.CustomerWhereInput = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    const allowedSortFields = [
      "name",
      "email",
      "company",
      "createdAt",
      "updatedAt",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderBy: Prisma.CustomerOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(orgId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        orders: { take: 5, orderBy: { createdAt: "desc" } },
        invoices: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

  async update(orgId: string, id: string, dto: UpdateCustomerDto) {
    await this.ensureCustomerExists(orgId, id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureCustomerExists(orgId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureCustomerExists(orgId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  async getCustomerActivities(orgId: string, customerId: string, limit = 10) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        entity: "Customer",
        entityId: customerId,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { select: { name: true } } },
    });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      metadata: log.metadata,
      actorName: log.actor?.name || "Unknown",
      createdAt: log.createdAt,
    }));
  }
}
