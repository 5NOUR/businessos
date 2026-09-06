import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QuerySearchDto } from "./dto/query-search.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(orgId: string, dto: QuerySearchDto) {
    const { query, entity } = dto;
    const page = dto.page || 1;
    const limit = dto.limit || 5;
    const skip = (page - 1) * limit;
    const take = limit;

    const searchString = query.trim();

    const results: any = {};

    if (!entity || entity === "all" || entity === "customers") {
      const where: Prisma.CustomerWhereInput = {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { name: { contains: searchString, mode: "insensitive" } },
          { email: { contains: searchString, mode: "insensitive" } },
          { company: { contains: searchString, mode: "insensitive" } },
        ],
      };
      const [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.customer.count({ where }),
      ]);
      results.customers = { items: customers, total };
    }

    if (!entity || entity === "all" || entity === "products") {
      const where: Prisma.ProductWhereInput = {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { name: { contains: searchString, mode: "insensitive" } },
          { sku: { contains: searchString, mode: "insensitive" } },
        ],
      };
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.product.count({ where }),
      ]);
      results.products = { items: products, total };
    }

    if (!entity || entity === "all" || entity === "orders") {
      const where: Prisma.OrderWhereInput = {
        organizationId: orgId,
        OR: [
          { orderNumber: { contains: searchString, mode: "insensitive" } },
          {
            customer: { name: { contains: searchString, mode: "insensitive" } },
          },
        ],
      };
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { name: true } } },
        }),
        this.prisma.order.count({ where }),
      ]);
      results.orders = { items: orders, total };
    }

    if (!entity || entity === "all" || entity === "invoices") {
      const where: Prisma.InvoiceWhereInput = {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { invoiceNumber: { contains: searchString, mode: "insensitive" } },
          {
            customer: { name: { contains: searchString, mode: "insensitive" } },
          },
        ],
      };
      const [invoices, total] = await Promise.all([
        this.prisma.invoice.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { name: true } } },
        }),
        this.prisma.invoice.count({ where }),
      ]);
      results.invoices = { items: invoices, total };
    }

    if (!entity || entity === "all" || entity === "employees") {
      const where: Prisma.EmployeeWhereInput = {
        organizationId: orgId,
        OR: [
          {
            member: {
              user: { name: { contains: searchString, mode: "insensitive" } },
            },
          },
          {
            member: {
              user: { email: { contains: searchString, mode: "insensitive" } },
            },
          },
          { position: { contains: searchString, mode: "insensitive" } },
        ],
      };
      const [employees, total] = await Promise.all([
        this.prisma.employee.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            member: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        }),
        this.prisma.employee.count({ where }),
      ]);
      results.employees = { items: employees, total };
    }

    return {
      query: searchString,
      page,
      limit,
      results,
    };
  }
}
