import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert.cart.item.dto';
import { CheckoutCartDto } from './dto/checkout.cart.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('active/:userId')
  @ApiOperation({ summary: 'Get or create active cart for a user' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getActiveCart(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const cart = await this.cartService.getActiveCart(userId);
    return { message: 'Cart retrieved successfully', data: cart };
  }

  @Post('item/:userId')
  @ApiOperation({ summary: 'Add or update an item in the cart' })
  @ApiResponse({
    status: 200,
    description: 'Item added or updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async upsertCartItem(
    @Param('userId') userId: string,
    @Body() upsertCartItemDto: UpsertCartItemDto,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const result = await this.cartService.upsertCartItem(
        userId,
        upsertCartItemDto,
      );
      return { message: result.message };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Product not found');
      }
      throw new BadRequestException('Error updating cart item');
    }
  }

  @Delete('item/:userId/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  async removeItemFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    if (!userId || !productId) {
      throw new BadRequestException('User ID and Product ID are required');
    }

    try {
      const result = await this.cartService.removeItemFromCart(
        userId,
        productId,
      );
      return { message: result.message };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Item not found in cart');
      }
      throw new BadRequestException('Error removing item from cart');
    }
  }

  @Post('checkout/:userId') // Finalizar la compra (checkout)
  @ApiOperation({
    summary: 'Finalizar la compra y enviar confirmación por correo',
  })
  @ApiResponse({ status: 200, description: 'Compra realizada con éxito' })
  async checkoutCart(
    @Param('userId') userId: string,
    @Body() checkoutCartDto: CheckoutCartDto,
  ) {
    return this.cartService.checkoutCart(userId, checkoutCartDto);
  }

  @Post('cancel/:userId') // Cancelar el carrito
  @ApiOperation({ summary: 'Cancelar el carrito' })
  @ApiResponse({ status: 200, description: 'Carrito cancelado' })
  async cancelCart(@Param('userId') userId: string) {
    return this.cartService.cancelCart(userId);
  }
}
