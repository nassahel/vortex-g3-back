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
  ) {}

  async getActiveCart(userId: string): Promise<{ id: string; items: any[] }> {
    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'PENDING' },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
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
         this.i18n.translate('error.CART_NOT_FOUND'),
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
         this.i18n.translate('error.PRODUCT_NOT_FOUND'),
      );
    }

    const cart = await this.getActiveCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      if (quantity === 0) {
        await this.prisma.cartItem.delete({ where: { id: existingItem.id } });
        return { message: await this.i18n.translate('error.ITEM_REMOVED') };
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });

      await this.recalculateCartTotal(cart.id);
      return { message: await this.i18n.translate('success.ITEM_UPDATED') };
    } else {
      await this.prisma.cartItem.create({
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
      where: { cartId },
    });

    const total = items.reduce(
      (acc, { price, quantity }) => acc.add(price.mul(quantity)), 
      new Decimal(0),
    );

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { price: total },
    });
  }

  async checkoutCart(
    userId: string,
    checkoutCartDto: CheckoutCartDto,
  ): Promise<{ message: string; link: string }> {
    try {
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
      const paymentFound = await this.prisma.payment.findFirst({
        where: { cartId: cart.id },
      });
      if (paymentFound) {
        return { message: 'Payment already exists', link: paymentFound.link };
      }
      const mpPaymentGenerated = await this.mercadoPagoService.createPayment(
        cart.id,
        Number(cart.price),
      );
      const payment = await this.prisma.payment.create({
        data: {
          cartId: cart.id,
          amount: Number(cart.price),
          method: 'MercadoPago',
          link: mpPaymentGenerated.init_point,
          status: 'PENDING',
        },
      });
      return {
        message: 'Payment generated',
        link: payment.link,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        this.i18n.translate('error.CART_NOT_FOUND'),
        error,
      );
    }
  }

  async cancelCart(userId: string): Promise<{ message: string }> {
    const cart = await this.getActiveCart(userId);
    if (!cart) {
      throw new NotFoundException(
        await this.i18n.translate('success.CART_CHECKOUT'),
      );
    }

    const cancelCart = await this.prisma.cart.update({
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
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      throw new NotFoundException(
        this.i18n.translate('error.ITEM_NOT_FOUND'),
      );
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });

    await this.recalculateCartTotal(cart.id);
    return { message: await this.i18n.translate('error.ITEM_REMOVED') };
  }

  async updateStockFromCart(
    cartId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: { id: cartId, status: 'COMPLETED' },
        include: { items: true },
      });
      if (!cart) {
        throw new NotFoundException(
          this.i18n.translate('error.CART_NOT_FOUND'),
        );
      }
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
