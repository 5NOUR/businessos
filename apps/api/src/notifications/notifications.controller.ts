import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MembershipGuard } from "../common/guards/membership.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentOrgId } from "../common/decorators/current-org-id.decorator";
import { User } from "@prisma/client";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(MembershipGuard)
  create(
    @CurrentUser() user: User,
    @CurrentOrgId() orgId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(MembershipGuard)
  findAll(
    @CurrentOrgId() orgId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    // نحتاج معرف العضوية الحالية
    return this.notificationsService.findAll(orgId, "", query); // ستحتاج تعديل
  }

  @Patch(":id/read")
  @UseGuards(MembershipGuard)
  markAsRead(@CurrentOrgId() orgId: string, @Param("id") id: string) {
    return this.notificationsService.markAsRead(orgId, "", id); // ستحتاج تعديل
  }

  @Patch("read-all")
  @UseGuards(MembershipGuard)
  markAllAsRead(@CurrentOrgId() orgId: string) {
    return this.notificationsService.markAllAsRead(orgId, "");
  }
}
