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
import { SuppliersService } from "./suppliers.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { QuerySuppliersDto } from "./dto/query-suppliers.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";

@Controller("suppliers")
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("supplier:create")
  create(@CurrentOrgId() orgId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(orgId, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("supplier:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QuerySuppliersDto) {
    return this.suppliersService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("supplier:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.suppliersService.findOne(orgId, id);
  }

  @Patch(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("supplier:update")
  update(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(orgId, id, dto);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("supplier:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.suppliersService.remove(orgId, id);
  }
}
