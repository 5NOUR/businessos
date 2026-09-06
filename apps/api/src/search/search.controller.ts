import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SearchService } from "./search.service";
import { QuerySearchDto } from "./dto/query-search.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("search")
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions(
    "customer:read",
    "product:read",
    "order:read",
    "invoice:read",
    "employee:read",
  ) // يمكن تخفيفها
  search(@CurrentOrgId() orgId: string, @Query() query: QuerySearchDto) {
    return this.searchService.search(orgId, query);
  }
}
