import {
  IsUUID,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { AttendanceStatus } from "@prisma/client";

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
