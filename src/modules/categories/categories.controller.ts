import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categoria')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/new')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get('/all')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put('/update/:id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Put('/delete/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Put('/restore/:id')
  restore(@Param('id') id: string) {
    return this.categoriesService.restore(id);
  }
}
