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
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly i18n: I18nService,
  ) {}

  @Get('active/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CART_GET_OR_CREATE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.CART_RETRIEVED })
  async getActiveCart(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException(await this.i18n.translate('error.USER_ID_REQUIRED'));
    }

    const cart = await this.cartService.getActiveCart(userId);
    return { message: (await this.i18n.translate('success.CART_RETRIEVED')), data: cart };
  }

  @Post('item/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CART_ADD_OR_UPDATE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CART_ADD_OR_UPDATE_SUCCESS,
  })
  @ApiResponse({ status: 404, description: SWAGGER_TRANSLATIONS.CART_PRODUCT_NOT_FOUND })
  async upsertCartItem(
    @Param('userId') userId: string,
    @Body() upsertCartItemDto: UpsertCartItemDto,
  ) {
    if (!userId) {
      throw new BadRequestException(await this.i18n.translate('error.USER_ID_REQUIRED'));
    }

    try {
      const result = await this.cartService.upsertCartItem(
        userId,
        upsertCartItemDto,
      );
      return { message: result.message };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(await this.i18n.translate('error.PRODUCT_NOT_FOUND'));
      }
      throw new BadRequestException(await this.i18n.translate('error.UPDATING_CART'));
    }
  }

  @Delete('item/:userId/:productId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CART_REMOVE_ITEM })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.CART_REMOVE_ITEM_SUCCESS })
  @ApiResponse({ status: 404, description: SWAGGER_TRANSLATIONS.CART_ITEM_NOT_FOUND })
  async removeItemFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    if (!userId || !productId) {
      throw new BadRequestException(
        await this.i18n.translate('error.USER_ID_REQUIRED') 
        && await this.i18n.translate('error.PRODUCT_ID_REQUIRED'));
    }

    try {
      const result = await this.cartService.removeItemFromCart(
        userId,
        productId,
      );
      return { message: result.message };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(await this.i18n.translate('error.ITEM_NOT_FOUND'));
      }
      throw new BadRequestException(await this.i18n.translate('error.ITEM_NOT_REMOVED'));
    }
  }

  @Post('checkout/:userId') // Finalizar la compra (checkout)
  @ApiOperation({
    summary: SWAGGER_TRANSLATIONS.CART_CHECKOUT,
  })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.CART_CHECKOUT_SUCCESS })
  async checkoutCart(
    @Param('userId') userId: string,
    @Body() checkoutCartDto: CheckoutCartDto,
  ) {
    return this.cartService.checkoutCart(userId, checkoutCartDto);
  }

  @Post('cancel/:userId') // Cancelar el carrito
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CART_CHECKOUT_CANCEL })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.CART_CHECKOUT_CANCEL_SUCCESS })
  async cancelCart(@Param('userId') userId: string) {
    return this.cartService.cancelCart(userId);
  }
}
