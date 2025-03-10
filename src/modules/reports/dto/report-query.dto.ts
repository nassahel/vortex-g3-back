import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsNumber, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ChartQueryDto {
  @ApiProperty({ example: '2024-01-01', description: 'Start date for filtering data', required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', description: 'End date for filtering data', required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  endDate?: string;

  @ApiProperty({ example: 'asc', description: "Sorting order ('asc' or 'desc')", required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: i18nValidationMessage('dto.isIn') })
  order?: 'asc' | 'desc';

  @ApiProperty({ example: 5, description: 'Number of products to retrieve (1-10)', required: false, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('dto.isNumber') })
  @Max(10, { message: i18nValidationMessage('dto.max') })
  @Min(1, { message: i18nValidationMessage('dto.min') })
  numberProduct?: number;
}
