import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    orgId: string,
    senderId: string | null,
    dto: CreateNotificationDto,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        organizationId: orgId,
        recipientId: dto.recipientId,
        senderId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        data: dto.data,
      },
    });
    return notification;
  }

  async findAll(orgId: string, memberId: string, query: QueryNotificationsDto) {
    const { isRead } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: Prisma.NotificationWhereInput = {
      organizationId: orgId,
      OR: [{ recipientId: memberId }, { recipientId: null }],
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const orderBy: Prisma.NotificationOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.NotificationOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
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

  async markAsRead(orgId: string, memberId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        organizationId: orgId,
        recipientId: memberId,
      },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(orgId: string, memberId: string) {
    return this.prisma.notification.updateMany({
      where: { organizationId: orgId, recipientId: memberId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
