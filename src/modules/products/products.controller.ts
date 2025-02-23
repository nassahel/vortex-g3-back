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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';

@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/all')
  findAll(@Query() filters: FilterProductDto & PaginationArgs) {
    return this.productsService.findAll(filters);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('/create-product')
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

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  //Eliminado logico del producto
  @Patch('/soft-delete/:id')
  remove(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }

  //Restaurado logico del producto
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.productsService.restoreProduct(id);
  }
}
