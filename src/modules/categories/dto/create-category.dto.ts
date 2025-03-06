import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica', description: 'Nombre de la categoría' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @IsString({ message: 'El nombre debe ser un string.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  name: string;
}
