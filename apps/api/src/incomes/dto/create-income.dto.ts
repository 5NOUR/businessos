import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  category: string; // e.g., Sales, Services, Other

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
  paymentMethod?: string; // CASH, BANK_TRANSFER, CARD, OTHER
}
