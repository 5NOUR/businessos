import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from "class-validator";

export class CreateEmployeeDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string; // معرف العضوية OrganizationMember

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salary?: number;

  @IsDateString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  status?: string; // ACTIVE, INACTIVE, TERMINATED
}
