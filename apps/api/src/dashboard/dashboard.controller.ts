import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("summary")
  @UseGuards(MembershipGuard)
  getSummary(@CurrentOrgId() orgId: string) {
    return this.dashboardService.getSummary(orgId);
  }

  @Get("charts")
  @UseGuards(MembershipGuard)
  getCharts(
    @CurrentOrgId() orgId: string,
    @Query("period") period: "week" | "month" | "year" = "month",
  ) {
    return this.dashboardService.getCharts(orgId, period);
  }

  @Get("recent-activities")
  @UseGuards(MembershipGuard)
  getRecentActivities(
    @CurrentOrgId() orgId: string,
    @Query("limit") limit?: number,
  ) {
    return this.dashboardService.getRecentActivities(
      orgId,
      limit ? Number(limit) : 10,
    );
  }
}
