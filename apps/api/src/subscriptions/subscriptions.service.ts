import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { QuerySubscriptionsDto } from "./dto/query-subscriptions.dto";
import { Prisma, SubscriptionStatus } from "@prisma/client";

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSubscription(orgId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: orgId },
      include: { plan: true },
    });
    if (!subscription) {
      // إذا لم توجد، ننشئ اشتراك تجريبي مجاني
      return this.createTrialSubscription(orgId);
    }
    return subscription;
  }

  async createTrialSubscription(orgId: string) {
    const freePlan = await this.prisma.plan.findFirst({
      where: { name: "FREE" },
    });
    if (!freePlan)
      throw new BadRequestException("Free plan not found. Seed plans first.");

    return this.prisma.subscription.upsert({
      where: { organizationId: orgId },
      update: {},
      create: {
        organizationId: orgId,
        planId: freePlan.id,
        status: "TRIAL",
        startDate: new Date(),
        renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
      include: { plan: true },
    });
  }

  async updateSubscription(orgId: string, dto: UpdateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) throw new NotFoundException("Plan not found");

    return this.prisma.subscription.upsert({
      where: { organizationId: orgId },
      update: {
        planId: dto.planId,
        status: dto.status || "ACTIVE",
        renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : undefined,
      },
      create: {
        organizationId: orgId,
        planId: dto.planId,
        status: dto.status || "ACTIVE",
        startDate: new Date(),
        renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : new Date(),
      },
      include: { plan: true },
    });
  }

  async cancelSubscription(orgId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId: orgId },
    });
    if (!subscription) throw new NotFoundException("No subscription found");

    return this.prisma.subscription.update({
      where: { organizationId: orgId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }

  async findAll(orgId: string, query: QuerySubscriptionsDto) {
    const { status } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.SubscriptionWhereInput = {
      organizationId: orgId,
    };

    if (status) where.status = status as SubscriptionStatus;

    const orderBy: Prisma.SubscriptionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.SubscriptionOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { plan: true, organization: { select: { name: true } } },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async checkUsageLimit(
    orgId: string,
    resource: "users" | "customers" | "products" | "orders",
  ): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(orgId);
    const plan = subscription.plan;
    let max = Infinity;

    switch (resource) {
      case "users":
        max = plan.maxUsers;
        break;
      case "customers":
        max = plan.maxCustomers;
        break;
      case "products":
        max = plan.maxProducts;
        break;
      case "orders":
        max = plan.maxOrders;
        break;
    }

    const count = await this.getResourceCount(orgId, resource);
    return count < max;
  }

  private async getResourceCount(
    orgId: string,
    resource: string,
  ): Promise<number> {
    switch (resource) {
      case "users":
        return this.prisma.organizationMember.count({
          where: { organizationId: orgId },
        });
      case "customers":
        return this.prisma.customer.count({ where: { organizationId: orgId } });
      case "products":
        return this.prisma.product.count({ where: { organizationId: orgId } });
      case "orders":
        return this.prisma.order.count({ where: { organizationId: orgId } });
      default:
        return 0;
    }
  }
}
