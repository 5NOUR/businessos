import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LeavesService } from "./leaves.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("leaves")
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private leavesService: LeavesService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("leave:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateLeaveDto,
  ) {
    return this.leavesService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("leave:read")
  findAll(
    @CurrentOrgId() orgId: string,
    @Query("status") status?: string,
    @Query("employeeId") employeeId?: string,
  ) {
    return this.leavesService.findAll(orgId, status, employeeId);
  }

  @Patch(":id/status")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("leave:approve")
  updateStatus(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leavesService.updateStatus(orgId, id, user.id, dto);
  }
}
