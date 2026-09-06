import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
} from "class-validator";
import { LeadStage } from "@prisma/client";

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsOptional()
  stage?: LeadStage;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsOptional()
  expectedCloseDate?: Date;

  @IsNumber()
  @IsOptional()
  probability?: number;
}
