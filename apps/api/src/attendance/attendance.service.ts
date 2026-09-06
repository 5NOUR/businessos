import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateAttendanceDto) {
    // التحقق من أن الموظف ينتمي للمنظمة
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId: orgId },
    });
    if (!employee) throw new NotFoundException("Employee not found");

    const date = new Date(dto.date);
    // التحقق من عدم وجود سجل مسبق لنفس الموظف في نفس اليوم
    const existing = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: date,
        },
      },
    });
    if (existing)
      throw new BadRequestException(
        "Attendance already recorded for this date",
      );

    return this.prisma.attendance.create({
      data: {
        ...dto,
        organizationId: orgId,
        date: date,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
      },
    });
  }

  async findAll(
    orgId: string,
    employeeId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.AttendanceWhereInput = {
      organizationId: orgId,
    };

    if (employeeId) where.employeeId = employeeId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        employee: {
          include: {
            member: { include: { user: { select: { name: true } } } },
          },
        },
      },
      take: 100, // يمكن تحسينها بالـ pagination
    });
  }

  async findByEmployee(orgId: string, employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { organizationId: orgId, employeeId },
      orderBy: { date: "desc" },
      take: 50,
    });
  }
}
