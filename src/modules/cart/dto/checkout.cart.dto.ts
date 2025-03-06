import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutCartDto {
  
  @ApiProperty({ example: 'Domicilio', description: 'Método de entrega del pedido' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
