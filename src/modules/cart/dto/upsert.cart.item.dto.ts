import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertCartItemDto {
  @ApiProperty({ description: 'The id of the product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product' })
  @IsNotEmpty()
  quantity: number;
}
