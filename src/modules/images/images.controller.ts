import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { I18nService } from 'nestjs-i18n';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/upload-image/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_UPLOAD_IMAGE })
  @ApiParam({ name: 'id', example: '123', description: 'ID del producto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: 'Archivo de imagen (JPEG o PNG)' },
        altText: { type: 'string', example: 'Imagen del producto', description: 'Texto alternativo para la imagen' },
      },
    },
  })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_UPLOAD_IMAGE_SUCCESS })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(SWAGGER_TRANSLATIONS.MIMETYPE),
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
    return this.imagesService.uploadImage(id, image, altText);
  }

  @Get('/all/:productId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_GET_ALL })
  @ApiParam({ name: 'productId', example: '98765', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_GET_ALL_SUCCESS })
  findAll(@Param('productId') productId: string) {
    return this.imagesService.findAll(productId);
  }

  @Get('/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_GET_ONE })
  @ApiParam({ name: 'id', example: '456', description: 'ID de la imagen' })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_GET_ONE_SUCCESS })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_DELETE })
  @ApiParam({ name: 'id', example: '456', description: 'ID de la imagen' })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_DELETE_SUCCESS })
  remove(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }

  @Patch('/set-principal/:id')
  @ApiOperation({ summary: 'Establecer imagen principal' })
  @ApiParam({ name: 'id', example: '456', description: 'ID de la imagen' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: '98765', description: 'ID del producto' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen establecida como principal con éxito' })
 async setPrincipalImage(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.imagesService.setPrincipalImage(id, productId);
  }
}
