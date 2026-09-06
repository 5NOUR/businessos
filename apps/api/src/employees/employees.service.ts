import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { QueryEmployeesDto } from "./dto/query-employees.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateEmployeeDto) {
    // التحقق من وجود العضوية
    const member = await this.prisma.organizationMember.findUnique({
      where: { id: dto.memberId },
    });
    if (!member || member.organizationId !== orgId) {
      throw new BadRequestException("Invalid member for this organization");
    }

    // التحقق من عدم وجود موظف بنفس memberId
    const existing = await this.prisma.employee.findUnique({
      where: { memberId: dto.memberId },
    });
    if (existing) {
      throw new BadRequestException("Employee already exists for this member");
    }

    // توليد employeeId فريد
    const employeeCount = await this.prisma.employee.count({
      where: { organizationId: orgId },
    });
    const employeeId = `EMP-${String(employeeCount + 1).padStart(3, "0")}`;

    return this.prisma.employee.create({
      data: {
        ...dto,
        organizationId: orgId,
        employeeId, // تمت الإضافة
        joinDate: dto.joinDate ? new Date(dto.joinDate) : null,
        salary: dto.salary ?? null,
      },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
      },
    });
  }

  async findAll(orgId: string, query: QueryEmployeesDto) {
    const { search, department } = query;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";
    const page = query.page || 1;
    const limit = query.limit || 10;

    const where: Prisma.EmployeeWhereInput = {
      organizationId: orgId,
    };

    if (search) {
      where.OR = [
        {
          member: { user: { name: { contains: search, mode: "insensitive" } } },
        },
        {
          member: {
            user: { email: { contains: search, mode: "insensitive" } },
          },
        },
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    if (department) where.department = department;

    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.EmployeeOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          member: {
            include: { user: { select: { name: true, email: true } } },
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
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId: orgId },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
        attendance: { orderBy: { date: "desc" }, take: 10 },
        leaveRequests: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!employee) throw new NotFoundException("Employee not found");
    return employee;
  }

  async update(orgId: string, id: string, dto: UpdateEmployeeDto) {
    await this.ensureEmployeeExists(orgId, id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensureEmployeeExists(orgId, id);
    return this.prisma.employee.delete({ where: { id } });
  }

  private async ensureEmployeeExists(orgId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!employee) throw new NotFoundException("Employee not found");
  }
}
