import {
  IsUUID,
  IsNotEmpty,
  IsDateString,
  IsString,
  IsOptional,
} from "class-validator";

export class CreateLeaveDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // Annual, Sick, Personal, etc.

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  @IsNotEmpty()
  endDate: string; // YYYY-MM-DD

  @IsString()
  @IsOptional()
  reason?: string;
}
