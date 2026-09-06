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
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { QueryExpensesDto } from "./dto/query-expenses.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("expenses")
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("expense:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("expense:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("expense:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.expensesService.findOne(orgId, id);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("expense:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.expensesService.remove(orgId, id);
  }
}
