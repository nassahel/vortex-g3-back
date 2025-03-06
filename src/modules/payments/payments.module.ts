import { Module } from '@nestjs/common';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [MercadoPagoModule, CartModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
