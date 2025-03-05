import { Module } from '@nestjs/common';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';

@Module({
  imports: [MercadoPagoModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
