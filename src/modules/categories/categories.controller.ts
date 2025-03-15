import { Controller, Get, Post, Body, Param, Put, UseInterceptors, UploadedFile, Patch, Delete, Query, UseGuards, } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('category')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly i18n: I18nService,
  ) { }

  @Post('/new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_CREATE })
  @ApiBody({ type: CreateCategoryDto }) // Define el request body
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_CREATE_SUCCESS,
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Post('/upload-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_UPLOAD })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_UPLOAD_SUCCESS,
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.uploadCategory(file);
  }

  @Get('/all')
  @UseGuards()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ALL })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ALL_SUCCESS,
  })
  findAll(@Query() filters: PaginationArgs) {
    return this.categoriesService.findAll(filters);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: '123', description: 'ID de la categoría' })
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ONE })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_GET_ONE_SUCCESS,
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put('/update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_UPDATE })
  @ApiParam({ name: 'id', example: '123', description: 'ID de la categoría' })
  @ApiBody({ type: UpdateCategoryDto }) // Define el request body
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

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_DELETE })
  @ApiParam({ name: 'id', example: '123', description: 'ID de la categoría' })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_DELETE_SUCCESS,
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.removeCategory(id);
  }

  @Patch('/restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.CATEGORIES_RESTORE })
  @ApiParam({ name: 'id', example: '123', description: 'ID de la categoría' })
  @ApiResponse({
    status: 200,
    description: SWAGGER_TRANSLATIONS.CATEGORIES_RESTORE_SUCCESS,
  })
  restore(@Param('id') id: string) {
    return this.categoriesService.restoreCategory(id);
  }
}
