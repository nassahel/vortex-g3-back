import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  name?: string;
}
