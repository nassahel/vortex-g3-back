import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpsertCartItemDto } from './dto/upsert.cart.item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CheckoutCartDto } from './dto/checkout.cart.dto';
import { I18nService } from 'nestjs-i18n';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly mercadoPagoService: MercadoPagoService,
    //mail service una vez que se implemente
  ) {}

  async getActiveCart(userId: string): Promise<{ id: string; items: any[] }> {
    let cart = await this.prisma.cart.findFirst({
      // Aqui lo busca y lo incluye
      where: { userId, status: 'PENDING' },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        //Aqui lo crea
        data: {
          userId,
          status: 'PENDING',
          price: new Decimal(0),
        },
        include: { items: true },
      });
    }
    return cart;
  }

  async getAllCarts() {
    try {
      const allCarts = await this.prisma.cart.findMany({
        where: { status: { in: ['COMPLETED', 'PENDING'] } },
      });
      return allCarts;
    } catch (error) {
      throw new BadRequestException(
        await this.i18n.translate('error.CART_NOT_FOUND'),
        error,
      );
    }
  }

  async upsertCartItem(
    userId: string,
    upsertCartItemDto: UpsertCartItemDto,
  ): Promise<{ message: string }> {
    const { productId, quantity } = upsertCartItemDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(
        await this.i18n.translate('error.PRODUCT_NOT_FOUND'),
      );
    }

    const cart = await this.getActiveCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      //Busca el item en el carrito
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      if (quantity === 0) {
        await this.prisma.cartItem.delete({ where: { id: existingItem.id } }); //Elimina el item del carrito
        return { message: await this.i18n.translate('error.ITEM_REMOVED') };
      }

      await this.prisma.cartItem.update({
        //Actualiza la cantidad del item
        where: { id: existingItem.id },
        data: { quantity },
      });

      await this.recalculateCartTotal(cart.id);
      return { message: await this.i18n.translate('success.ITEM_UPDATED') };
    } else {
      await this.prisma.cartItem.create({
        //Crea un nuevo item en el carrito
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
      });

      await this.recalculateCartTotal(cart.id);
      return { message: await this.i18n.translate('success.ITEM_ADDED') };
    }
  }

  private async recalculateCartTotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      //busca los productos
      where: { cartId },
    });

    const total = items.reduce(
      (acc, { price, quantity }) => acc.add(price.mul(quantity)), //Itera sobre el arreglo 'items' y suma el costo de cada item multiplicado por la cantidad
      new Decimal(0),
    );

    await this.prisma.cart.update({
      //actualiza el carrito
      where: { id: cartId },
      data: { price: total },
    });
  }

  async checkoutCart(
    userId: string,
    checkoutCartDto: CheckoutCartDto,
    payMethod: string,
  ): Promise<{ message: string; link: string }> {
    try {
      //Obtener el carrito activo del usuario
      const cart = await this.prisma.cart.findFirst({
        where: { userId, status: { in: ['PENDING', 'INPROCESS'] } }, // Permite checkout desde ambos estados
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException(
          this.i18n.translate('error.CART_NOT_FOUND'),
        );
      }

      if (cart.items.length === 0) {
        throw new NotFoundException(this.i18n.translate('error.CART_EMPTY'));
      }
      /////////////////////////////////////////////////
      console.log('payMethod', payMethod);
      //VERIFICAR METODO DE PAGO ELEGIDO
      if (payMethod === 'Card') {
        const payment = await this.prisma.payment.create({
          data: {
            cartId: cart.id,
            amount: Number(cart.price),
            method: 'Card',
            link: 'no link',
            status: 'COMPLETED',
          },
        });
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { status: 'COMPLETED' },
        });
        return { message: 'Payment completed', link: 'no link' };
      } else {
        //verificar si el link del pago ya existe
        const paymentFound = await this.prisma.payment.findFirst({
          where: { cartId: cart.id },
        });
        if (paymentFound) {
          return { message: 'Payment already exists', link: paymentFound.link };
        }
        //generar pago en MP con datos del carrito
        const mpPaymentGenerated = await this.mercadoPagoService.createPayment(
          cart.id,
          Number(cart.price),
        );
        //crear pago pendiente en la base de datos
        const payment = await this.prisma.payment.create({
          data: {
            cartId: cart.id,
            amount: Number(cart.price),
            method: 'MercadoPago',
            link: mpPaymentGenerated.init_point,
            status: 'PENDING',
          },
        });
        //incluir el servicio de mail una vez que se implemente
        //retorno un mensaje de pago generado y el link del pago para redirigir al usuario
        return {
          message: 'Payment generated',
          link: payment.link,
        };
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        this.i18n.translate('error.CART_NOT_FOUND'),
        error,
      );
    }
  }

  async cancelCart(userId: string): Promise<{ message: string }> {
    const cart = await this.getActiveCart(userId); //Obtiene el carrito activo
    if (!cart) {
      throw new NotFoundException(
        await this.i18n.translate('success.CART_CHECKOUT'),
      );
    }

    const cancelCart = await this.prisma.cart.update({
      //Actualiza el carrito a 'CANCELED'
      where: { id: cart.id },
      data: { status: 'CANCELED' },
    });

    return { message: await this.i18n.translate('success.CART_CANCELED') };
  }

  async removeItemFromCart(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const cart = await this.getActiveCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      //Busca el item en el carrito
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      throw new NotFoundException(
        await this.i18n.translate('error.ITEM_NOT_FOUND'),
      );
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } }); //Elimina el item del carrito

    await this.recalculateCartTotal(cart.id); //Recalcula el total del carrito
    return { message: await this.i18n.translate('error.ITEM_REMOVED') };
  }

  async updateStockFromCart(
    cartId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      //obtener el carrito por id
      const cart = await this.prisma.cart.findUnique({
        where: { id: cartId, status: 'COMPLETED' },
        include: { items: true },
      });
      if (!cart) {
        throw new NotFoundException(
          this.i18n.translate('error.CART_NOT_FOUND'),
        );
      }
      //actualizar el stock de los items del carrito
      for (const item of cart.items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return { success: true, message: 'Stock updated' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        this.i18n.translate('error.CART_NOT_FOUND'),
        error,
      );
    }
  }
}
