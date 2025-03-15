import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electrónica', description: 'Nombre de la categoría' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(3, { message: i18nValidationMessage('dto.minLength') })
  name: string;
}
