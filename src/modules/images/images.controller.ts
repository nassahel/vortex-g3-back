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

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('/upload-image/:id')
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
            new BadRequestException('Only JPEG and PNG files are allowed'),
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
  findAll(@Param('productId') productId: string) {
    return this.imagesService.findAll(productId);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }

  @Patch('/set-principal/:id')
  async setPrincipalImage(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.imagesService.setPrincipalImage(id, productId);
  }
}
