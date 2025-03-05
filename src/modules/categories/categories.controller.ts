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
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';

@Controller('category')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly i18n: I18nService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('/new')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_CREATE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_CREATE_SUCCESS,
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('/upload-categories')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_UPLOAD })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_UPLOAD_SUCCESS,
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.uploadCategory(file);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('/all')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ALL })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ALL_SUCCESS,
  })
  findAll(@Query() filters: PaginationArgs) {
    return this.categoriesService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ONE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ONE_SUCCESS,
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Put('/update/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_UPDATE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_UPDATE_SUCCESS,
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete('/delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_DELETE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_DELETE_SUCCESS,
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.removeCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch('/restore/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_RESTORE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_RESTORE_SUCCESS,
  })
  restore(@Param('id') id: string) {
    return this.categoriesService.restoreCategory(id);
  }
}
