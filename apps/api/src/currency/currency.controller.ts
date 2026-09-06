import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { Query } from "@nestjs/common";
@Controller("currency")
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Get("config")
  @UseGuards(MembershipGuard)
  getConfig(@CurrentOrgId() orgId: string) {
    return this.currencyService.getCurrencyConfig(orgId);
  }

  @Get("convert")
  @UseGuards(MembershipGuard)
  convert(
    @CurrentOrgId() _orgId: string,
    @Query("amount") amount: number,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.currencyService.convertAmount(amount, from, to);
  }
}
