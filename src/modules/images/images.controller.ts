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
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { I18nService } from 'nestjs-i18n';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/upload-image/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_UPLOAD_IMAGE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_UPLOAD_IMAGE_SUCCESS })
  @UseInterceptors(
    FileInterceptor('image', {
      //Configuro como manejar la carga de archivos
      storage: memoryStorage(), //almaceno en la memoria
      limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño limite de 5MB
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
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_GET_ALL_SUCCESS })
  findAll(@Param('productId') productId: string) {
    return this.imagesService.findAll(productId);
  }

  @Get('/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_GET_ONE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_GET_ONE_SUCCESS })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.IMAGES_DELETE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.IMAGES_DELETE_SUCCESS })
  remove(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }
}
