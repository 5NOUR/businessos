import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { QuerySuppliersDto } from "./dto/query-suppliers.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        ...dto,
        organizationId: orgId,
      },
    });
  }

  async findAll(orgId: string, query: QuerySuppliersDto) {
    const { search } = query;
    const where: Prisma.SupplierWhereInput = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const orderBy: Prisma.SupplierOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.SupplierOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
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
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: { products: true },
    });
    if (!supplier) throw new NotFoundException("Supplier not found");
    return supplier;
  }

  async update(orgId: string, id: string, dto: UpdateSupplierDto) {
    await this.ensureSupplierExists(orgId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureSupplierExists(orgId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureSupplierExists(orgId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!supplier) throw new NotFoundException("Supplier not found");
  }
}
