import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
} from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('/upload')
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body('altText') altText: string,
  ) {
    return this.imagesService.uploadImage(id, image, altText);
  }

  @Get('/all')
  findAll() {
    return this.imagesService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  /* @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto);
  } */

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }
}
