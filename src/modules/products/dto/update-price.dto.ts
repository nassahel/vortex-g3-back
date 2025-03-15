import { IsNumber, Min, IsOptional, IsArray, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePriceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Min(1, { message: i18nValidationMessage('dto.min') })
  price?: number;
}
