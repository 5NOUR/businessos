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
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { QueryInvoicesDto } from "./dto/query-invoices.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("invoices")
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(orgId, user.id, dto);
  }

  @Post("from-order/:orderId")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:create")
  createFromOrder(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.invoicesService.createFromOrder(orgId, user.id, orderId);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryInvoicesDto) {
    return this.invoicesService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.invoicesService.findOne(orgId, id);
  }

  @Patch(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:update")
  update(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(orgId, id, dto);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("invoice:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.invoicesService.remove(orgId, id);
  }
}
