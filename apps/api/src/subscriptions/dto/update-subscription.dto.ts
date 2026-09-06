import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from "class-validator";
import { SubscriptionStatus } from "@prisma/client";

export class UpdateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDateString()
  @IsOptional()
  renewalDate?: string;
}
