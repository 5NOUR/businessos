import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { QueryProjectsDto } from "./dto/query-projects.dto";
import { Prisma, ProjectStatus } from "@prisma/client";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId: orgId,
        status: "ACTIVE",
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
      },
    });

    if (dto.memberIds && dto.memberIds.length > 0) {
      await this.prisma.projectMember.createMany({
        data: dto.memberIds.map((memberId) => ({
          projectId: project.id,
          memberId,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async findAll(orgId: string, query: QueryProjectsDto) {
    const { search, status } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.ProjectWhereInput = {
      organizationId: orgId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status as ProjectStatus;

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.ProjectOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          members: true,
          tasks: { select: { id: true, status: true } },
        },
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(orgId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId: orgId },
      include: {
        members: {
          include: {
            member: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
        tasks: {
          include: {
            assignees: {
              include: {
                member: { include: { user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(orgId: string, id: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(orgId, id);
    const { memberIds, ...rest } = dto;

    await this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        startDate: rest.startDate ? new Date(rest.startDate) : undefined,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
      },
    });

    if (memberIds) {
      await this.prisma.projectMember.deleteMany({ where: { projectId: id } });
      if (memberIds.length > 0) {
        await this.prisma.projectMember.createMany({
          data: memberIds.map((memberId) => ({ projectId: id, memberId })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureProjectExists(orgId, id);
    return this.prisma.project.delete({ where: { id } });
  }

  private async ensureProjectExists(orgId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!project) throw new NotFoundException("Project not found");
  }
}
