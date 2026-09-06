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
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { QueryProjectsDto } from "./dto/query-projects.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("project:create")
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("project:read")
  findAll(@CurrentOrgId() orgId: string, @Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(orgId, query);
  }

  @Get(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("project:read")
  findOne(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.projectsService.findOne(orgId, id);
  }

  @Patch(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("project:update")
  update(
    @CurrentOrgId() orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(orgId, id, dto);
  }

  @Delete(":id")
  @UseGuards(MembershipGuard, PermissionsGuard)
  @RequirePermissions("project:delete")
  remove(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.projectsService.remove(orgId, id);
  }
}
