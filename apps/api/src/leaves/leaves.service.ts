import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { Prisma, LeaveStatus } from "@prisma/client";

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, _employeeId: string, dto: CreateLeaveDto) {
    // التأكد من أن الموظف يتبع المنظمة
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId: orgId },
    });
    if (!employee) throw new NotFoundException("Employee not found");

    return this.prisma.leaveRequest.create({
      data: {
        organizationId: orgId,
        employeeId: dto.employeeId,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: "PENDING",
      },
    });
  }

  async findAll(orgId: string, status?: string, employeeId?: string) {
    const where: Prisma.LeaveRequestWhereInput = {
      organizationId: orgId,
    };

    if (status) where.status = status as LeaveStatus;
    if (employeeId) where.employeeId = employeeId;

    return this.prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
      take: 100,
    });
  }

  async updateStatus(
    orgId: string,
    id: string,
    reviewerId: string,
    dto: UpdateLeaveStatusDto,
  ) {
    const leaveRequest = await this.prisma.leaveRequest.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!leaveRequest) throw new NotFoundException("Leave request not found");

    // التحقق من صلاحية المراجع: يجب أن يكون Manager أو Owner
    const reviewer = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        userId: reviewerId,
        role: { in: ["OWNER", "MANAGER"] },
      },
    });
    if (!reviewer) {
      throw new ForbiddenException(
        "Only managers or owners can approve/reject leave requests",
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
      },
    });
  }
}
