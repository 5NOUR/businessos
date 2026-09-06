import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";
import { QueryReportDto } from "./dto/query-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("report:read")
  generate(@CurrentOrgId() orgId: string, @Query() query: QueryReportDto) {
    return this.reportsService.generateReport(orgId, query);
  }

  @Get("export")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("report:read")
  async export(
    @CurrentOrgId() orgId: string,
    @Query() query: QueryReportDto,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportCsv(orgId, query);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${query.type}-report.csv"`,
    );
    res.send(csv);
  }
}
