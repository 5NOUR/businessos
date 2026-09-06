import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { CreateMovementDto } from "./dto/create-movement.dto";
import { QueryMovementsDto } from "./dto/query-movements.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post("movements")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("inventory:create")
  createMovement(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateMovementDto,
  ) {
    return this.inventoryService.createMovement(orgId, user.id, dto);
  }

  @Get("movements")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("inventory:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryMovementsDto) {
    return this.inventoryService.findAll(orgId, query);
  }

  @Get("movements/product/:productId")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("inventory:read")
  getMovementsForProduct(
    @CurrentOrgId() orgId: string,
    @Param("productId") productId: string,
  ) {
    return this.inventoryService.getMovementsForProduct(orgId, productId);
  }
}
