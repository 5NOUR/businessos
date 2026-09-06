import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { getPermissionsForRole } from "../common/constants/permissions";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    // إنشاء منظمة جديدة
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug || this.generateSlug(dto.name),
        logoUrl: dto.logoUrl,
      },
    });

    // إضافة المستخدم المنشئ كمالك
    await this.prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId,
        role: "OWNER",
      },
    });

    return organization;
  }

  async getMyOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
    });
    return memberships.map((m) => m.organization);
  }

  async getOrganizationById(orgId: string) {
    // MembershipGuard سيتكفل بالتحقق من العضوية، لذا نعيد المنظمة مباشرة
    return this.prisma.organization.findUnique({
      where: { id: orgId },
    });
  }

  async addMember(orgId: string, dto: AddMemberDto, currentUserId: string) {
    // التحقق من أن المستخدم الحالي هو Owner أو Manager
    const currentMembership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId: currentUserId },
      },
    });
    if (
      !currentMembership ||
      (currentMembership.role !== "OWNER" &&
        currentMembership.role !== "MANAGER")
    ) {
      throw new ForbiddenException("Only owners and managers can add members");
    }

    // البحث عن المستخدم بالبريد
    const userToAdd = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!userToAdd) {
      throw new BadRequestException("User with this email does not exist");
    }

    // التحقق من عدم وجود عضوية مسبقة
    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId: userToAdd.id },
      },
    });
    if (existing) {
      throw new BadRequestException(
        "User is already a member of this organization",
      );
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: userToAdd.id,
        role: dto.role,
      },
      include: { user: true },
    });
  }

  async getMembers(orgId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: { user: true },
    });
  }

  async getMyPermissions(orgId: string, userId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId },
      },
    });
    if (!membership) {
      throw new ForbiddenException("Not a member");
    }
    return getPermissionsForRole(membership.role);
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 6)
    );
  }
}
