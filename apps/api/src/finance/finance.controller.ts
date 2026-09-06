import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("finance")
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get("summary")
  @UseGuards(MembershipGuard)
  getSummary(
    @CurrentOrgId() orgId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financeService.getSummary(orgId, startDate, endDate);
  }
}
