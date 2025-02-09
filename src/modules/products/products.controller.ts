import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';

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
