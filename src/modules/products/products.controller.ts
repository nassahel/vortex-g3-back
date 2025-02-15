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
  Put,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdatePriceDto } from './dto/update-price.dto';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Get('/all')
  findAll(@Query() filters: FilterProductDto) {
    return this.productsService.findAll(filters);
  }

  @Get('/all-deleted')
  findAllDeleted() {
    return this.productsService.findAllDeleted();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('create-product')
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiResponse({ status: 201, description: 'Producto creado correctamente' })
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
        throw new BadRequestException('Los datos del producto son requeridos.');
      }
      const createdProduct = await this.productsService.createProduct(
        createProductDto,
        images || [],
      );

      return createdProduct;
    } catch (error) {
      console.error('Error en la creación del producto:', error);
      throw new BadRequestException('Error al crear el producto.');
    }
  }

  @Post('/upload-products')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.uploadProduct(file);
  }

  @Put('/update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Post('/upload-image/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      //Configuro como manejar la carga de archivos
      storage: memoryStorage(), //almaceno en la memoria
      limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño limite de 5MB
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only JPEG and PNG files are allowed'),
            false,
          );
        }
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body('altText') altText: string,
  ) {
    return this.productsService.uploadImage(id, image, altText);
  }

  @Delete('/delete-image/:id')
  deleteImage(@Param('id') id: string) {
    return this.productsService.deleteImage(id);
  }

  //Eliminado logico del producto
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }
  //Restaurado logico del producto
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.productsService.restoreProduct(id);
  }

  @Patch('/incrementar-precio-productos')
  incrementarPrecioAll(@Body() body: UpdatePriceDto) {
    return this.productsService.incrementAllPrice(body);
  }

  /* @Patch('/decrementar-precio-productos')
  decrementarPrecioAll(@Body() body: UpdateStockDto) {
    return this.productsService.decrementarPrecioAll(body);
  } */
}
