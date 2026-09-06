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
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryCustomersDto) {
    return this.customersService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.customersService.findOne(orgId, id);
  }

  @Patch(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:update")
  update(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(orgId, id, dto);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.customersService.remove(orgId, id);
  }

  @Get(":id/activities")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("customer:read")
  getActivities(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Query("limit") limit?: number,
  ) {
    return this.customersService.getCustomerActivities(
      orgId,
      id,
      limit ? Number(limit) : 10,
    );
  }
}
