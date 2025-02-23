import { Injectable, NotFoundException } from '@nestjs/common';
import { UpsertCartItemDto } from './dto/upsert.cart.item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CheckoutCartDto } from './dto/checkout.cart.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    //mail service una vez que se implemente
  ) {}

  async getActiveCart(userId: string): Promise<{ id: string; items: any[] }> {
    let cart = await this.prisma.order.findFirst({
      // Aqui lo busca y lo incluye
      where: { userId, status: 'PENDING' },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.order.create({
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

  async upsertCartItem(
    userId: string,
    upsertCartItemDto: UpsertCartItemDto,
  ): Promise<{ message: string }> {
    const { productId, quantity } = upsertCartItemDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(await this.i18n.translate('error.PRODUCT_NOT_FOUND'));
    }

    const cart = await this.getActiveCart(userId);

    const existingItem = await this.prisma.orderItem.findFirst({
      //Busca el item en el carrito
      where: { orderId: cart.id, productId },
    });

    if (existingItem) {
      if (quantity === 0) {
        await this.prisma.orderItem.delete({ where: { id: existingItem.id } }); //Elimina el item del carrito
        return { message: await this.i18n.translate('error.ITEM_REMOVED') };
      }

      await this.prisma.orderItem.update({
        //Actualiza la cantidad del item
        where: { id: existingItem.id },
        data: { quantity },
      });

      await this.recalculateCartTotal(cart.id);
      return { message: await this.i18n.translate('success.ITEM_UPDATED') };
    } else {
      await this.prisma.orderItem.create({
        //Crea un nuevo item en el carrito
        data: {
          orderId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
      });

      await this.recalculateCartTotal(cart.id);
      return { message: await this.i18n.translate('success.ITEM_ADDED') };
    }
  }
  private async recalculateCartTotal(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      //busca los productos
      where: { orderId },
    });

    const total = items.reduce(
      (acc, { price, quantity }) => acc.add(price.mul(quantity)), //Itera sobre el arreglo 'items' y suma el costo de cada item multiplicado por la cantidad
      new Decimal(0),
    );

    await this.prisma.order.update({
      //actualiza el carrito
      where: { id: orderId },
      data: { price: total },
    });
  }
  async checkoutCart(
    userId: string,
    checkoutCartDto: CheckoutCartDto,
  ): Promise<{ message: string; cart: object }> {
    const cart = await this.prisma.order.findFirst({
      where: { userId, status: { in: ['PENDING', 'INPROCESS'] } }, // Permite checkout desde ambos estados
      include: { items: true },
    });
    if (cart.items.length === 0) {
      throw new NotFoundException(await this.i18n.translate('error.CART_EMPTY'));
    }

    const completedCart = await this.prisma.order.update({
      //Actualiza el carrito a 'COMPLETED'
      where: { id: cart.id },
      data: { status: 'COMPLETED' },
      include: { items: true },
    });

    //incluir el servicio de mail una vez que se implemente

    return {
      message: await this.i18n.translate('success.CART_CHECKOUT'),
      cart: completedCart,
    };
  }

  async cancelCart(userId: string): Promise<{ message: string }> {
    const cart = await this.getActiveCart(userId); //Obtiene el carrito activo
    if (!cart) {
      throw new NotFoundException(await this.i18n.translate('success.CART_CHECKOUT'));
    }

    const cancelCart = await this.prisma.order.update({
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

    const item = await this.prisma.orderItem.findFirst({
      //Busca el item en el carrito
      where: { orderId: cart.id, productId },
    });

    if (!item) {
      throw new NotFoundException(await this.i18n.translate('error.ITEM_NOT_FOUND'));
    }

    await this.prisma.orderItem.delete({ where: { id: item.id } }); //Elimina el item del carrito

    await this.recalculateCartTotal(cart.id); //Recalcula el total del carrito
    return { message: await this.i18n.translate('error.ITEM_REMOVED') };
  }
}
