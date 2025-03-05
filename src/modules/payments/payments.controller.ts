import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payments.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    const event = req.body;
    console.log(event);
    return this.paymentService.mercadopagoWebhook(event);
  }
}
