import { BadRequestException, Injectable } from '@nestjs/common';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadopagoService: MercadoPagoService,
    private readonly cartService: CartService,
  ) {}

  async mercadopagoWebhook(event: any) {
    try {
      if (event.type === 'payment') {
        const paymentId = event.data.id;
        const payment = await this.mercadopagoService.getPayment(paymentId);

        if (payment.status === 'approved') {
          const cartId = payment.metadata.order_id;
          const cartFounded = await this.prisma.cart.findFirst({
            where: {
              id: cartId,
              payment: { status: 'PENDING' },
            },
            include: { payment: true },
          });

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
            //enviar correo de pago realizado
            //actualizar stock de productos
            const result = await this.cartService.updateStockFromCart(
              cartFounded.id,
            );
            if (result.success) {
              return {
                message: 'Pago realizado correctamente y stock actualizado',
              };
            } else {
              throw new Error('Error al actualizar el stock');
            }
          } else {
            throw new Error('Payment not found');
          }
        }
      }
    } catch (error) {
      return { message: 'Error al procesar el pago', error: error.message };
    }
  }

  async getAllPayments() {
    try {
      const payments = await this.prisma.payment.findMany({
        include: { cart: true },
      });
      return payments;
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Error al obtener los pagos');
    }
  }
}
