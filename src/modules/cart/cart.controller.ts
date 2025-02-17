import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add.cart.item.dto';
import { UpdateCartItemDto } from './dto/update.cart.item.dto';
import { CheckoutCartDto } from './dto/checkout.cart.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiResponse({ status: 201, description: 'Product added to the cart' })
  @Post('add/:userId')
  async addItem(
    @Param('userId') userId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItemToCart(userId, addCartItemDto);
  }

  @Put('update/:userId/:productId')
  @ApiOperation({
    summary: 'Actualizar la cantidad de un producto en el carrito',
  })
  @ApiResponse({ status: 200, description: 'Carrito actualizado' })
  async updateItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      userId,
      productId,
      updateCartItemDto,
    );
  }

  @Delete('remove/:userId/:productId') // Eliminar un producto del carrito
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  @ApiResponse({ status: 200, description: 'Producto eliminado del carrito' })
  async removeItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItemFromCart(userId, productId);
  }

  @Get('active/:userId') // Consultar el carrito activo
  @ApiOperation({ summary: 'Obtener el carrito activo del usuario' })
  @ApiResponse({ status: 200, description: 'Carrito activo' })
  async getActiveCart(@Param('userId') userId: string) {
    return this.cartService.getActiveCart(userId);
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
