import { IsOptional, IsString, IsDateString } from "class-validator";

export class QueryReportDto {
  @IsString()
  type: string; // sales, revenue, expenses, inventory, customers, employees

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  category?: string; // لبعض التقارير

  @IsString()
  @IsOptional()
  status?: string;
}
