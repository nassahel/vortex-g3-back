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
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0.' })
  price: number;

  @IsNotEmpty({ message: 'La cantidad es requerida.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0.' })
  stock: number;

  @IsNotEmpty({ message: 'La categoría es requerida.' })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
