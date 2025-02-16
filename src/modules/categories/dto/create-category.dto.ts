import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  name: string;
}
