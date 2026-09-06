import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { QuerySubscriptionsDto } from "./dto/query-subscriptions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get("current")
  @UseGuards(MembershipGuard)
  getCurrent(@CurrentOrgId() orgId: string) {
    return this.subscriptionsService.getCurrentSubscription(orgId);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("subscription:read")
  findAll(
    @CurrentOrgId() orgId: string,
    @Query() query: QuerySubscriptionsDto,
  ) {
    return this.subscriptionsService.findAll(orgId, query);
  }

  @Patch("update")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("subscription:update")
  update(@CurrentOrgId() orgId: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.updateSubscription(orgId, dto);
  }

  @Post("cancel")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("subscription:update")
  cancel(@CurrentOrgId() orgId: string) {
    return this.subscriptionsService.cancelSubscription(orgId);
  }
}
