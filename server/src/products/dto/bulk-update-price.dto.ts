import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkPriceItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;
}

export class BulkUpdatePricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPriceItemDto)
  items: BulkPriceItemDto[];
}
