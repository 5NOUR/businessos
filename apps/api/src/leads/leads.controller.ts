import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { QueryLeadsDto } from "./dto/query-leads.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("leads")
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:create")
  create(@CurrentOrgId() orgId: string, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(orgId, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.leadsService.findOne(orgId, id);
  }

  @Patch(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:update")
  update(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(orgId, id, dto);
  }

  @Patch(":id/stage")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:update")
  updateStage(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body("stage") stage: string,
  ) {
    return this.leadsService.updateStage(orgId, id, stage);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("lead:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.leadsService.remove(orgId, id);
  }
}
