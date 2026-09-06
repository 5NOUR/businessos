import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PurchasesService } from "./purchases.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { QueryPurchaseOrdersDto } from "./dto/query-purchase-orders.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("purchases")
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("purchase:create")
  create(@CurrentOrgId() orgId: string, @Body() dto: CreatePurchaseOrderDto) {
    return this.purchasesService.create(orgId, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("purchase:read")
  findAll(
    @CurrentOrgId() orgId: string,
    @Query() query: QueryPurchaseOrdersDto,
  ) {
    return this.purchasesService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("purchase:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.purchasesService.findOne(orgId, id);
  }

  @Post(":id/receive")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("purchase:update")
  receive(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
  ) {
    return this.purchasesService.receiveOrder(orgId, id, user.id);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("purchase:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.purchasesService.remove(orgId, id);
  }
}
