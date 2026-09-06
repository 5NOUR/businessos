import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { QueryPaymentsDto } from "./dto/query-payments.dto";
import { Prisma, PaymentStatus, InvoiceStatus } from "@prisma/client";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, organizationId: orgId },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");

    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const invoiceTotal = Number(invoice.total);
    const newPaymentAmount = Number(dto.amount);

    if (newPaymentAmount <= 0)
      throw new BadRequestException("Amount must be positive");
    if (totalPaid + newPaymentAmount > invoiceTotal) {
      throw new BadRequestException("Payment exceeds invoice total");
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          organizationId: orgId,
          invoiceId: dto.invoiceId,
          amount: newPaymentAmount,
          method: dto.method,
          reference: dto.reference,
          note: dto.note,
          status: "PAID",
          createdById: userId,
          paidAt: new Date(),
        },
      });

      const newTotalPaid = totalPaid + newPaymentAmount;
      let paymentStatus: PaymentStatus = "UNPAID";
      let invoiceStatus: InvoiceStatus = invoice.status;

      if (newTotalPaid >= invoiceTotal) {
        paymentStatus = "PAID";
        invoiceStatus = "PAID";
      } else if (newTotalPaid > 0) {
        paymentStatus = "PARTIALLY_PAID";
      }

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: {
          paymentStatus,
          status: invoiceStatus,
        },
      });

      return payment;
    });
  }

  async findAll(orgId: string, query: QueryPaymentsDto) {
    const { invoiceId } = query;
    const sortBy = query.sortBy || "paidAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
    };

    if (invoiceId) where.invoiceId = invoiceId;

    const orderBy: Prisma.PaymentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.PaymentOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { invoice: { select: { invoiceNumber: true } } },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
