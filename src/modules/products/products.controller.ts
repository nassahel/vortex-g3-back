import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('producto')
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

  @Post('/new')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.upload(file);
  }

  @Put('/update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }
  //Eliminado logico del producto
  @Put('/delete/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
  //Restaurado logico del producto
  @Put('/restore/:id')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }
}
