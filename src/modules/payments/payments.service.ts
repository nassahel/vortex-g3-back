import { Injectable } from '@nestjs/common';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadopagoService: MercadoPagoService,
  ) {}

  async mercadopagoWebhook(event: any) {
    try {
      if (event.type === 'payment') {
        const paymentId = event.data.id;
        const payment = await this.mercadopagoService.getPayment(paymentId);
        console.log('payment', payment);
        if (payment.status === 'approved') {
          const cartId = payment.metadata.purchase_id;
          const cartFounded = await this.prisma.cart.findFirst({
            where: {
              id: cartId,
              payment: { status: 'PENDING' },
            },
            include: { payment: true },
          });
          console.log('cartFounded', cartFounded);
          if (cartFounded) {
            //actualizar el pago a COMPLETED
            await this.prisma.payment.update({
              where: { id: cartFounded.payment.id },
              data: { status: 'COMPLETED', paymentId },
            });
            //actualizar el carrito a COMPLETED
            await this.prisma.cart.update({
              where: { id: cartFounded.id },
              data: { status: 'COMPLETED' },
            });
            return { message: 'Compra actualizada correctamente' };
          } else {
            throw new Error('Payment not found');
          }
        }
      }
    } catch (error) {
      return { message: 'Error al crear la compra', error: error.message };
    }
  }
}
