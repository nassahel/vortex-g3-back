import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Put,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';
import { ProfileDto } from './dto/profile.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('/all/profiles')
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_GET_ALL })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.PROFILE_GET_ALL_SUCCESS })
  findAll() {
    return this.profileService.getAllProfiles();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Post('create/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_CREATE }) //Para documentacion de Swagger
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PROFILE_CREATE_SUCCESS })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', example: '123', description: 'ID del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Imagen de perfil' },
        name: { type: 'string', example: 'Juan Pérez', description: 'Nombre del usuario' },
        bio: { type: 'string', example: 'Desarrollador de software', description: 'Biografía' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite de archivo
    }),
  )
  async createdProfile(
    @Param('userId') userId: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() updateProfileDto?: ProfileDto,
  ) {
    if (!userId) {
      throw new BadRequestException(this.i18n.t('errors.USER_ID_REQUIRED'));
    }
    const createdProfile = await this.profileService.createProfile(
      userId,
      updateProfileDto,
      file,
    );
    return createdProfile;
  }

  // Ruta para subir la imagen
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_UPLOAD }) // Documentación de Swagger
  @ApiResponse({ status: 201, description: SWAGGER_TRANSLATIONS.PROFILE_UPLOAD_SUCCESS }) // Respuesta 201 en caso de éxito
  @ApiConsumes('multipart/form-data') // Indica que la ruta consume archivos
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Imagen de perfil' },
        userId: { type: 'string', example: '123', description: 'ID del usuario' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Almaceno en la memoria
      limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño límite de 5MB
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException(SWAGGER_TRANSLATIONS.MIMETYPE), false);
        }
      },
    }),
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File, // Obtengo el archivo
    @Body('userId') userId: string,
  ) {
    const imageUrl = await this.profileService.uploadImage(file, userId);
    return { message: this.i18n.t('success.IMAGE_UPLOADED'), data: imageUrl };
  }

  //Ruta para eliminar la imagen
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('delete/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_DELETE }) //Para documentacion de Swagger
  @ApiParam({ name: 'userId', example: '123', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.PROFILE_DELETE_SUCCESS }) //Para que responda con un 200 en el caso de que se elimine con exito
  async deleteProfileImage(@Param('userId') userId: string) {
    //Recibe userId como parametro
    const result = await this.profileService.deleteImage(userId); //Llama al servicio para eliminar la imagen
    return { message: this.i18n.t('success.IMAGE_DELETED'), data: result };
  }

  //Actualizar la info del usuario
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('update/:userId')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.PROFILE_UPDATE })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.PROFILE_UPDATE_SUCCESS })
  @ApiParam({ name: 'userId', example: '123', description: 'ID del usuario' })
  @ApiBody({ type: ProfileDto })
  async updateProfile(
    @Param('userId') userId: string,
    @Body(new ValidationPipe({ transform: true }))
    updateProfileDto: ProfileDto,
  ) {
    const updatedUser = await this.profileService.updateProfile(
      userId,
      updateProfileDto,
    );
    return { message: await this.i18n.t('success.PROFILE_UPDATED'), data: updatedUser };
  }
}
