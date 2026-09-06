import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMovementDto } from "./dto/create-movement.dto";
import { QueryMovementsDto } from "./dto/query-movements.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createMovement(orgId: string, userId: string, dto: CreateMovementDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, organizationId: orgId, deletedAt: null },
    });
    if (!product) throw new NotFoundException("Product not found");

    // تحديد الإشارة بناءً على النوع
    let signedQuantity = dto.quantity;
    if (dto.type === "SALE" || dto.type === "RETURN") {
      // البيع يقلل المخزون، الإرجاع يزيد المخزون (حسب المنطق)
      // نعتبر SALE = خصم، RETURN = إضافة، PURCHASE = إضافة، ADJUSTMENT = يمكن موجب أو سالب
      if (dto.type === "SALE") {
        signedQuantity = -Math.abs(dto.quantity);
        // التحقق من كفاية المخزون
        if (product.currentStock < Math.abs(signedQuantity)) {
          throw new BadRequestException("Insufficient stock");
        }
      } else if (dto.type === "RETURN") {
        signedQuantity = Math.abs(dto.quantity);
      } else if (dto.type === "PURCHASE") {
        signedQuantity = Math.abs(dto.quantity);
      } else {
        // ADJUSTMENT قد يكون موجب أو سالب، سنأخذ القيمة كما هي
        signedQuantity = dto.quantity;
      }
    }

    // استخدام transaction لضمان التحديث المتسق
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          organizationId: orgId,
          productId: dto.productId,
          type: dto.type,
          quantity: signedQuantity,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          note: dto.note,
          createdById: userId,
        },
      });

      // تحديث currentStock
      const newStock = product.currentStock + signedQuantity;
      if (newStock < 0) {
        throw new BadRequestException("Insufficient stock");
      }

      await tx.product.update({
        where: { id: dto.productId },
        data: { currentStock: newStock },
      });

      return movement;
    });
  }

  async findAll(orgId: string, query: QueryMovementsDto) {
    const { productId, type } = query;
    const where: Prisma.InventoryMovementWhereInput = {
      organizationId: orgId,
    };

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type as any;
    }
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 20;
    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.InventoryMovementOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.inventoryMovement.count({ where }),
      this.prisma.inventoryMovement.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { select: { name: true, sku: true } } },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMovementsForProduct(orgId: string, productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { organizationId: orgId, productId },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, sku: true } } },
    });
  }
}
