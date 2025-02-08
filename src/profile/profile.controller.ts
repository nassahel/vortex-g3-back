import { Controller, Post, Body, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update.profile.dto';


@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService:ProfileService){}

    //Ruta para subir la imagen
    @Post('upload')
    @ApiOperation({summary: 'Upload profile image'})        //Para documentacion de Swagger
    @ApiResponse({ status: 201, description: 'Image successfully uploaded'})        //Pra que responda con un 201 en el caso de que se suba con exito
    @ApiConsumes('multipart/form-data')     //La ruta consume datos en ese formato, que es el que se usa para cargar archivos
    @UseInterceptors(FileInterceptor('file', {      //Configuro como manejar la carga de archivos
        storage: memoryStorage(),                   //almaceno en la memoria
        limits: {fileSize: 5 * 1024 * 1024},        // Tamaño limite de 5MB
        fileFilter: (req, file, callback) => {
            if (file.mimetype === 'image.png' || file.mimetype === 'image.jpeg'){
                callback(null, true);
            } else {
                callback(new BadRequestException('Only JPEG and PNG files are allowed'), false);
            }
        }
    }))

    async uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,  //con @UploadedFile obtenemos el archivo que el usuario sube
        @Body('userId') userId: string,
        ){        
        const imageUrl = await this.profileService.uploadImage(file, userId);         //Llama al servicio AwsService para manejar la carga de la imagen
        return { message: 'Image successfully uploaded', data: imageUrl};
    }


    //Ruta para eliminar la imagen
    @Delete('delete/:userId')
    @ApiOperation({ summary: 'Delete profile image'})
    @ApiResponse({ status: 200, description: 'Image successfully deleted'})
    async deleteProfileImage(@Param('userId') userId: string){      //Recibe userId como parametro
        const result = await this.profileService.deleteImage(userId);   //Llama al servicio para eliminar la imagen
        return { message: 'Image successfully deleted', data: result};
    }

    //Actualizar la info del usuario
    @Put('update/:userId')
    @ApiOperation({ summary: 'Update user profile information' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(
        @Param('userId') userId: string,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        const updatedUser = await this.profileService.updateProfile(userId, updateProfileDto);
        return { message: 'Profile updated successfully', data: updatedUser };
    }

}
