import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
} from "class-validator";
import { NotificationType } from "@prisma/client";

export class CreateNotificationDto {
  @IsUUID()
  @IsOptional()
  recipientId?: string; // معرف OrganizationMember (اختياري)

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
