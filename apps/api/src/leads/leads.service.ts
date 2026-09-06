import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { QueryLeadsDto } from "./dto/query-leads.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        organizationId: orgId,
        // لا نضيف createdById لأنه غير موجود في الـ Schema الحالي
      },
      include: { customer: { select: { name: true } }, assignedTo: true },
    });
  }
  async findAll(orgId: string, query: QueryLeadsDto) {
    const { search, stage } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: Prisma.LeadWhereInput = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (stage) {
      where.stage = stage as any;
    }

    // بناء orderBy بشكل آمن
    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.LeadOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, name: true } },
          assignedTo: {
            select: { id: true, user: { select: { name: true } } },
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
    const lead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        customer: true,
        assignedTo: { include: { user: true } },
      },
    });
    if (!lead) throw new NotFoundException("Lead not found");
    return lead;
  }

  async update(orgId: string, id: string, dto: UpdateLeadDto) {
    await this.ensureLeadExists(orgId, id);
    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { customer: { select: { name: true } }, assignedTo: true },
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureLeadExists(orgId, id);
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // تحديث المرحلة فقط (للـ Drag & Drop)
  async updateStage(orgId: string, id: string, stage: string) {
    await this.ensureLeadExists(orgId, id);
    return this.prisma.lead.update({
      where: { id },
      data: { stage: stage as any },
    });
  }

  private async ensureLeadExists(orgId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!lead) throw new NotFoundException("Lead not found");
  }
}
