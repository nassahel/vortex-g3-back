import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un string.' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0.' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0.' })
  stock?: number;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser un string.' })
  categoryId?: string;
}
