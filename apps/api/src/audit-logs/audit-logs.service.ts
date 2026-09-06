import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        actorId: dto.actorId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        metadata: dto.metadata,
      },
    });
  }

  async findAll(orgId: string, query: QueryAuditLogsDto) {
    const { entity, actorId, action, startDate, endDate } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: orgId,
    };

    if (entity) where.entity = entity;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.AuditLogOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          actor: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    return this.prisma.auditLog.findFirst({
      where: { id, organizationId: orgId },
      include: { actor: { select: { name: true, email: true } } },
    });
  }
}
