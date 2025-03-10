import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsArray } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateProductDto {
  @ApiProperty({ example: 'Producto de ejemplo', description: 'Nombre del producto' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  name: string;

  @ApiProperty({ example: 'Descripción del producto', description: 'Descripción del producto', required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  description?: string;

  @ApiProperty({ example: 99.99, description: 'Precio del producto' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Min(0, { message: i18nValidationMessage('dto.min') })
  price: number;

  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Min(0, { message: i18nValidationMessage('dto.min') })
  stock: number;

  @ApiProperty({ example: ['Electrónica', 'Hogar'], description: 'Categorías del producto' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error('categories must be a valid JSON array');
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true, message: i18nValidationMessage('dto.isStringEach') })
  categories: string[];

  @ApiProperty({ example: ['imagen1.jpg', 'imagen2.jpg'], description: 'URLs de imágenes', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: i18nValidationMessage('dto.isStringEach') })
  images?: string[];
}
