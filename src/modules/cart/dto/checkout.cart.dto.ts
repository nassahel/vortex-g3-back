import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CheckoutCartDto {

  @ApiProperty({ example: 'Domicilio', description: 'Método de entrega del pedido' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  shippingAddress?: string;
}
