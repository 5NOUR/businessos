import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { QueryTasksDto } from "./dto/query-tasks.dto";
import { Prisma, TaskStatus, Priority } from "@prisma/client";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateTaskDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, organizationId: orgId },
    });
    if (!project) throw new NotFoundException("Project not found");

    const task = await this.prisma.task.create({
      data: {
        organizationId: orgId,
        projectId: dto.projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status || "TODO",
        priority: dto.priority || "MEDIUM",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
      },
    });

    if (dto.assigneeIds && dto.assigneeIds.length > 0) {
      await this.prisma.taskAssignee.createMany({
        data: dto.assigneeIds.map((memberId) => ({
          taskId: task.id,
          memberId,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignees: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async findAll(orgId: string, query: QueryTasksDto) {
    const { projectId, status, priority } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.TaskWhereInput = {
      organizationId: orgId,
    };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status as TaskStatus;
    if (priority) where.priority = priority as Priority;

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.TaskOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: { select: { name: true } },
          assignees: {
            include: {
              member: { include: { user: { select: { name: true } } } },
            },
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
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId: orgId },
      include: {
        project: true,
        assignees: {
          include: {
            member: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
        comments: {
          include: {
            author: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async update(orgId: string, id: string, dto: UpdateTaskDto) {
    await this.ensureTaskExists(orgId, id);
    const { assigneeIds, ...rest } = dto;

    await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
      },
    });

    if (assigneeIds) {
      await this.prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (assigneeIds.length > 0) {
        await this.prisma.taskAssignee.createMany({
          data: assigneeIds.map((memberId) => ({ taskId: id, memberId })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async updateStatus(orgId: string, id: string, dto: UpdateTaskStatusDto) {
    await this.ensureTaskExists(orgId, id);
    return this.prisma.task.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureTaskExists(orgId, id);
    return this.prisma.task.delete({ where: { id } });
  }

  private async ensureTaskExists(orgId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!task) throw new NotFoundException("Task not found");
  }
}
