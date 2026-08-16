import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  // Free-text category — no dropdown restriction
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  brand?: string;

  // Colors as an array of strings e.g. ["Red", "Blue"]
  @IsOptional()
  @IsArray()
  colors?: string[];

  // Sizes as an array of strings e.g. ["S", "M", "L", "XL"]
  @IsOptional()
  @IsArray()
  sizes?: string[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;
}
