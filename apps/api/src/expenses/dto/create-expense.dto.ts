import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string; // e.g., Rent, Salaries, Marketing, etc.

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
