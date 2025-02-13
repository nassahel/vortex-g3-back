import {
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
} from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsNotEmpty({ message: 'Ingresa el stock' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0.' })
  stock?: number;
}
