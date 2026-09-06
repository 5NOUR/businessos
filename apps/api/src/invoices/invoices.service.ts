import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { QueryInvoicesDto } from "./dto/query-invoices.dto";
import { Prisma, InvoiceStatus } from "@prisma/client";

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId: orgId },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    // حساب الإجمالي
    let subtotal = 0;
    for (const item of dto.items) {
      subtotal += item.quantity * item.unitPrice - (item.discount || 0);
    }
    const discount = dto.discount || 0;
    const taxPercent = dto.tax || 0;
    const taxAmount = (subtotal - discount) * (taxPercent / 100);
    const total = subtotal - discount + taxAmount;

    // توليد رقم فاتورة
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const num = parseInt(lastInvoice.invoiceNumber.split("-")[1] || "0", 10);
      nextNum = num + 1;
    }
    const invoiceNumber = `INV-${String(nextNum).padStart(5, "0")}`;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          organizationId: orgId,
          customerId: dto.customerId,
          orderId: dto.orderId,
          invoiceNumber,
          status: "DRAFT",
          paymentStatus: "UNPAID",
          subtotal,
          discount,
          tax: taxAmount,
          total,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          notes: dto.notes,
          createdById: userId,
        },
      });

      for (const item of dto.items) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: 0,
            total: item.quantity * item.unitPrice - (item.discount || 0),
          },
        });
      }

      return invoice;
    });
  }

  async createFromOrder(orgId: string, userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId },
      include: { items: true, customer: true },
    });
    if (!order) throw new NotFoundException("Order not found");

    // تحويل عناصر الطلب إلى عناصر فاتورة مع تحويل Decimal إلى number
    const items = order.items.map((item) => ({
      productId: item.productId,
      description: `Order ${order.orderNumber} - item ${item.productId}`,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
    }));

    // حساب نسبة الضريبة من الطلب (إذا كانت الضريبة مبلغًا وليست نسبة)
    const subtotalNum = Number(order.subtotal);
    const taxPercent =
      subtotalNum > 0
        ? (Number(order.tax) / (subtotalNum - Number(order.discount))) * 100
        : 0;
    return this.create(orgId, userId, {
      customerId: order.customerId,
      orderId: order.id,
      items,
      discount: Number(order.discount),
      tax: taxPercent,
    });
  }

  async findAll(orgId: string, query: QueryInvoicesDto) {
    const { customerId, status } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.InvoiceWhereInput = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (customerId) where.customerId = customerId;
    if (status) where.status = status as InvoiceStatus;

    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.InvoiceOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { name: true } },
          payments: true,
        },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
        order: true,
      },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async update(orgId: string, id: string, dto: UpdateInvoiceDto) {
    await this.ensureInvoiceExists(orgId, id);
    const { items, ...rest } = dto;
    return this.prisma.invoice.update({
      where: { id },
      data: rest,
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureInvoiceExists(orgId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureInvoiceExists(orgId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
  }
}
