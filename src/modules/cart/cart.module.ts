import { Module } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { CartController } from './cart.controller';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [MercadoPagoModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
