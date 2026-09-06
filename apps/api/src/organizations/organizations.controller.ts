import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User } from "@prisma/client";

@Controller("organizations")
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateOrganizationDto) {
    // إنشاء منظمة لا يتطلب عضوية مسبقة، لذا لا نضع MembershipGuard هنا
    return this.organizationsService.createOrganization(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    // عرض المنظمات التي ينتمي إليها المستخدم، لا يحتاج عضوية محددة
    return this.organizationsService.getMyOrganizations(user.id);
  }

  @Get(":orgId")
  @UseGuards(MembershipGuard)
  findOne(@Param("orgId") orgId: string) {
    // أي عضو يمكنه رؤية منظمته
    return this.organizationsService.getOrganizationById(orgId);
  }

  @Post(":orgId/members")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("member:create")
  addMember(
    @Param("orgId") orgId: string,
    @CurrentUser() user: User,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizationsService.addMember(orgId, dto, user.id);
  }

  @Get(":orgId/members")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("member:read")
  getMembers(@Param("orgId") orgId: string) {
    return this.organizationsService.getMembers(orgId);
  }

  // Endpoint لمعرفة صلاحيات المستخدم الحالي في منظمة معينة
  @Get(":orgId/my-permissions")
  @UseGuards(MembershipGuard)
  getMyPermissions(@Param("orgId") orgId: string, @CurrentUser() user: User) {
    return this.organizationsService.getMyPermissions(orgId, user.id);
  }
}
