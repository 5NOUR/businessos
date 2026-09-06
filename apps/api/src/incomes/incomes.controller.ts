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
import { IncomesService } from "./incomes.service";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { QueryIncomesDto } from "./dto/query-incomes.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("incomes")
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private incomesService: IncomesService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("income:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateIncomeDto,
  ) {
    return this.incomesService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("income:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryIncomesDto) {
    return this.incomesService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("income:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.incomesService.findOne(orgId, id);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("income:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.incomesService.remove(orgId, id);
  }
}
