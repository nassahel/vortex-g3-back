import { IsNumber, Min, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdatePriceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(1, { message: 'El precio debe ser mayor o igual a 1.' })
  price?: number;
}
