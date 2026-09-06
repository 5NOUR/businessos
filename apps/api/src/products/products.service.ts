import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { QueryProductsDto } from "./dto/query-products.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateProductDto) {
    const { currentStock = 0, ...productData } = dto;

    // التحقق من عدم وجود SKU مكرر
    const existing = await this.prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId: orgId,
          sku: productData.sku,
        },
      },
    });
    if (existing) {
      throw new BadRequestException("SKU already exists in this organization");
    }

    // إنشاء المنتج برصيد صفر
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        organizationId: orgId,
        currentStock: 0,
      },
    });

    // إذا كانت هناك كمية افتتاحية، أنشئ حركة مخزون وحدّث الرصيد
    if (currentStock > 0) {
      await this.prisma.$transaction(async (tx) => {
        await tx.inventoryMovement.create({
          data: {
            organizationId: orgId,
            productId: product.id,
            type: "ADJUSTMENT",
            quantity: currentStock,
            referenceType: "INITIAL",
            note: "Initial stock",
            createdById: userId, // استخدم userId الفعلي
          },
        });
        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: currentStock },
        });
      });
    }

    return this.prisma.product.findUnique({ where: { id: product.id } });
  }

  async findAll(orgId: string, query: QueryProductsDto) {
    const { search, categoryId, status } = query;
    const where: Prisma.ProductWhereInput = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.ProductOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, supplier: true },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        category: true,
        supplier: true,
        inventoryMovements: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async update(orgId: string, id: string, dto: UpdateProductDto) {
    await this.ensureProductExists(orgId, id);
    // لا نسمح بتعديل currentStock هنا
    delete dto.currentStock;
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureProductExists(orgId, id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureProductExists(orgId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!product) throw new NotFoundException("Product not found");
  }
}
