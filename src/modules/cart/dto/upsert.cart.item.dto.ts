import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertCartItemDto {
  @ApiProperty({ example: '98765', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Cantidad de productos en el carrito' })
  @IsNotEmpty()
  quantity: number;
}
