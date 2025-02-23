import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';

@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/new')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Post('/upload-categories')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.uploadCategory(file);
  }

  @Get('/all')
  findAll(@Query() filters: PaginationArgs) {
    return this.categoriesService.findAll(filters);
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
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.removeCategory(id);
  }

  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.categoriesService.restoreCategory(id);
  }
}
