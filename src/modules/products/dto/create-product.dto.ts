import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @IsString({ message: 'El nombre debe ser un string.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string.' })
  description?: string;

  @IsNotEmpty({ message: 'El precio es requerido.' })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0.' })
  price: number;

  @IsNotEmpty({ message: 'La cantidad es requerida.' })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0.' })
  stock: number;

  @IsNotEmpty({ message: 'La categoría es requerida.' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // Convierte el string en array
      } catch {
        throw new Error('categories must be a valid JSON array');
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
