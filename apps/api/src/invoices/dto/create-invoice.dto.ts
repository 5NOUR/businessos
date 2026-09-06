import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

class InvoiceItemDto {
  @IsUUID()
  @IsOptional() // قد لا يكون مرتبطًا بمنتج
  productId?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsOptional()
  orderId?: string; // اختياري لإنشاء فاتورة من طلب

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number; // خصم عام

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number; // نسبة مئوية

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
