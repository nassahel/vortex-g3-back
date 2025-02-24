import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update.profile.dto';
import { AuthService } from '../auth/auth.service';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('create/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_CREATE }) //Para documentacion de Swagger
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PROFILE_CREATE_SUCCESS })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite de archivo
    }),
  )
  async createdProfile(
    @Param('userId') userId: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() updateProfileDto?: UpdateProfileDto,
  ) {
    if (!userId) {
      throw new BadRequestException(await this.i18n.t('errors.USER_ID_REQUIRED'));
    }
    const createdProfile = await this.profileService.createProfile(
      userId,
      updateProfileDto,
      file,
    );
    return createdProfile;
  }

  //Ruta para subir la imagen
  @Post('upload')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_UPLOAD }) //Para documentacion de Swagger
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PROFILE_UPLOAD_SUCCESS }) //Pra que responda con un 201 en el caso de que se suba con exito
  @ApiConsumes('multipart/form-data') //La ruta consume datos en ese formato, que es el que se usa para cargar archivos
  @UseInterceptors(
    FileInterceptor('file', {
      //Configuro como manejar la carga de archivos
      storage: memoryStorage(), //almaceno en la memoria
      limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño limite de 5MB
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'image.png' || file.mimetype === 'image.jpeg') {
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
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File, //con @UploadedFile obtenemos el archivo que el usuario sube
    @Body('userId') userId: string,
  ) {
    const imageUrl = await this.profileService.uploadImage(file, userId); //Llama al servicio AwsService para manejar la carga de la imagen
    return { message: await this.i18n.t('success.IMAGE_UPLOADED'), data: imageUrl };
  }

  //Ruta para eliminar la imagen
  @Delete('delete/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_DELETE }) //Para documentacion de Swagger
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.PROFILE_DELETE_SUCCESS }) //Para que responda con un 200 en el caso de que se elimine con exito
  async deleteProfileImage(@Param('userId') userId: string) {
    //Recibe userId como parametro
    const result = await this.profileService.deleteImage(userId); //Llama al servicio para eliminar la imagen
    return { message: await this.i18n.t('success.IMAGE_DELETED'), data: result };
  }

  //Actualizar la info del usuario
  @Put('update/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_UPDATE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.PROFILE_UPDATE_SUCCESS })
  async updateProfile(
    @Param('userId') userId: string,
    @Body(new ValidationPipe({ transform: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.profileService.updateProfile(
      userId,
      updateProfileDto,
    );
    return { message: await this.i18n.t('success.PROFILE_UPDATED'), data: updatedUser };
  }
}
