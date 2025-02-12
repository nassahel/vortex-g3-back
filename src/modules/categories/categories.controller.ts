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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categoria')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/new')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Post('/upload-categories')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.upload(file);
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

  @Patch('/delete/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.categoriesService.restore(id);
  }
}
