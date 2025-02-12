import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filters-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      //Configuro como manejar la carga de archivos
      storage: memoryStorage(), //almaceno en la memoria
      limits: { fileSize: 10 * 1024 * 1024 }, // Tamaño limite de 5MB
      fileFilter: (req, file, callback) => {
        console.log(file);
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
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productsService.create(createProductDto, images);
  }

  @Post('/upload-products')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.upload(file);
  }

  @Put('/update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('/update-images/:id')
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      //Configuro como manejar la carga de archivos
      storage: memoryStorage(), //almaceno en la memoria
      limits: { fileSize: 10 * 1024 * 1024 }, // Tamaño limite de 5MB
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
  updateImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productsService.updateImages(id, images);
  }

  //Eliminado logico del producto
  @Patch('/delete/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
  //Restaurado logico del producto
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }
}
