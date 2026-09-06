import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { QueryPurchaseOrdersDto } from "./dto/query-purchase-orders.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreatePurchaseOrderDto) {
    // التحقق من وجود المورد
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, organizationId: orgId },
    });
    if (!supplier) throw new NotFoundException("Supplier not found");

    // التحقق من وجود المنتجات
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, organizationId: orgId },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found");
    }

    // إنشاء طلب الشراء مع العناصر داخل transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          organizationId: orgId,
          supplierId: dto.supplierId,
          notes: dto.notes,
          status: "DRAFT",
        },
      });

      for (const item of dto.items) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          },
        });
      }

      return order;
    });
  }

  async findAll(orgId: string, query: QueryPurchaseOrdersDto) {
    const { supplierId, status } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.PurchaseOrderWhereInput = {
      organizationId: orgId,
    };

    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const orderBy: Prisma.PurchaseOrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.PurchaseOrderOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          supplier: { select: { name: true } },
          items: {
            include: { product: { select: { name: true, sku: true } } },
          },
        },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId: orgId },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException("Purchase order not found");
    return order;
  }

  // استلام الطلب: تحويل الحالة إلى RECEIVED وتحديث المخزون
  async receiveOrder(orgId: string, id: string, userId: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId: orgId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Purchase order not found");
    if (order.status === "RECEIVED") {
      throw new BadRequestException("Order already received");
    }

    return this.prisma.$transaction(async (tx) => {
      // تحديث حالة الطلب
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: "RECEIVED" },
      });

      // إنشاء حركة مخزون لكل عنصر
      for (const item of order.items) {
        await tx.inventoryMovement.create({
          data: {
            organizationId: orgId,
            productId: item.productId,
            type: "PURCHASE",
            quantity: item.quantity,
            referenceType: "PURCHASE_ORDER",
            referenceId: id,
            note: `Purchase order ${id}`,
            createdById: userId,
          },
        });

        // تحديث رصيد المنتج
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
      }

      return { success: true };
    });
  }

  async remove(orgId: string, id: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!order) throw new NotFoundException("Purchase order not found");
    if (order.status === "RECEIVED") {
      throw new BadRequestException("Cannot delete received order");
    }

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }
}
