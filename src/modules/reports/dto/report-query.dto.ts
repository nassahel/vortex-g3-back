import { IsOptional, IsString, IsIn, IsNumber, Max, Min } from 'class-validator';

export class ChartQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';


  @IsOptional()
  @IsNumber()
  @Max(10)
  @Min(1)
  numberProduct?: number;
}
