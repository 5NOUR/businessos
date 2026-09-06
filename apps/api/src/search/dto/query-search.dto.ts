import { IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class QuerySearchDto {
  @IsString()
  query: string; // نص البحث

  @IsOptional()
  @IsString()
  entity?: string; // customers, products, orders, invoices, employees, all

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5; // عدد النتائج لكل كيان
}
