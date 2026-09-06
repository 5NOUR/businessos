import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { QueryOrdersDto } from "./dto/query-orders.dto";
import { Prisma, OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateOrderDto) {
    // التحقق من وجود العميل
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId: orgId },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    // التحقق من وجود المنتجات
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, organizationId: orgId },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found");
    }

    // حساب الإجماليات
    let subtotal = 0;
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }
      subtotal += item.quantity * item.unitPrice;
    }

    const discount = dto.discount || 0;
    const taxPercent = dto.tax || 0;
    const taxAmount = (subtotal - discount) * (taxPercent / 100);
    const total = subtotal - discount + taxAmount;

    // توليد رقم طلب تسلسلي
    const lastOrder = await this.prisma.order.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    });
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastNum = parseInt(lastOrder.orderNumber.split("-")[1] || "0", 10);
      nextNumber = lastNum + 1;
    }
    const orderNumber = `ORD-${String(nextNumber).padStart(5, "0")}`;

    // إنشاء الطلب والعناصر داخل transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          organizationId: orgId,
          customerId: dto.customerId,
          orderNumber,
          status: "PENDING",
          paymentStatus: "UNPAID",
          subtotal,
          discount,
          tax: taxAmount,
          total,
          notes: dto.notes,
          createdById: userId,
        },
      });

      for (const item of dto.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: 0,
            total: item.quantity * item.unitPrice - (item.discount || 0),
          },
        });
      }

      return order;
    });
  }

  async findAll(orgId: string, query: QueryOrdersDto) {
    const { customerId, status } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.OrderWhereInput = {
      organizationId: orgId,
    };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status as OrderStatus;

    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.OrderOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { name: true } },
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
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId: orgId },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdBy: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(
    orgId: string,
    id: string,
    userId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId: orgId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Order not found");

    const newStatus = dto.status;

    // قواعد انتقال الحالة
    const validTransitions: Record<string, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    // عند الاكتمال، خصم المخزون
    if (newStatus === "COMPLETED") {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || product.currentStock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product ${product?.name || item.productId}`,
            );
          }
          await tx.inventoryMovement.create({
            data: {
              organizationId: orgId,
              productId: item.productId,
              type: "SALE",
              quantity: -item.quantity,
              referenceType: "ORDER",
              referenceId: id,
              note: `Order ${order.orderNumber}`,
              createdById: userId,
            },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: newStatus, paymentStatus: "PAID" },
        });
        return { success: true };
      });
    }

    // عند الإلغاء بعد الاكتمال، إعادة المخزون
    if (newStatus === "CANCELLED" && order.status === "COMPLETED") {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.inventoryMovement.create({
            data: {
              organizationId: orgId,
              productId: item.productId,
              type: "RETURN",
              quantity: item.quantity,
              referenceType: "ORDER_CANCELLATION",
              referenceId: id,
              note: `Cancelled order ${order.orderNumber}`,
              createdById: userId,
            },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: newStatus, paymentStatus: "CANCELLED" },
        });
        return { success: true };
      });
    }

    // تحديث بسيط للحالة
    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(orgId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (order.status !== "CANCELLED") {
      throw new BadRequestException("Only cancelled orders can be deleted");
    }
    return this.prisma.order.delete({ where: { id } });
  }
}
