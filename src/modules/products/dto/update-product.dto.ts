import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  name?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Min(0, { message: i18nValidationMessage('dto.min') })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Min(0, { message: i18nValidationMessage('dto.min') })
  stock?: number;

  @IsOptional()
  categories?: string[];
}
