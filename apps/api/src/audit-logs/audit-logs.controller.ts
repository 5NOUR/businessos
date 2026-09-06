import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuditLogsService } from "./audit-logs.service";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("audit-logs")
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("audit:create")
  create(@CurrentOrgId() orgId: string, @Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(orgId, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("audit:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("audit:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.auditLogsService.findOne(orgId, id);
  }
}
