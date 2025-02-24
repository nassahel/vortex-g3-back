import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';

@Controller('product')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/create-product')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_CREATE })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_CREATE_SUCCESS })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por imagen
    }),
  )
  async createdProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    try {
      if (!createProductDto) {
        throw new BadRequestException(await this.i18n.t('error.REQUIRED_DATA'));
      }
      const createdProduct = await this.productsService.createProduct(
        createProductDto,
        images || [],
      );

      return createdProduct;
    } catch (error) {
      throw new BadRequestException(await this.i18n.t('error.PRODUCT_CREATION_FAILED'));
    }
  }

  @Post('/upload-products')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_UPLOAD })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_UPLOAD_SUCCESS })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.uploadProduct(file);
  }

  @Get('/all')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_GET_ALL })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_GET_ALL_SUCCESS })
  findAll(@Query() filters: FilterProductDto) {
    return this.productsService.findAll(filters);
  }

  @Get('/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_GET_ONE })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_GET_ONE_SUCCESS })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }


  @Patch('/update/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_UPDATE })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_UPDATE_SUCCESS })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  //Eliminado logico del producto
  @Delete('/delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_DELETE })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_DELETE_SUCCESS })
  remove(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }

  //Restaurado logico del producto
  @Patch('/restore/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PRODUCTS_RESTORE })
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PRODUCTS_RESTORE_SUCCESS })
  restore(@Param('id') id: string) {
    return this.productsService.restoreProduct(id);
  }
}
