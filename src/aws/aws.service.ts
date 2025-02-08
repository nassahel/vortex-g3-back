import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { awsConfig } from '../common/constants/index';
import * as crypto from 'crypto';


@Injectable()
export class AwsService {
    private s3Client: S3Client;         //inicializa un cliente de aws s3. s3client es la clase que permite interactuar con el servicio de almacenamiento s3
    private logger = new Logger(AwsService.name);       //ayuda a registrar errores o informacion relevante en los logs.

    constructor() {
        this.s3Client = new S3Client(awsConfig.client);         //se inicializa el cliente S3 con la sonfiguracion de aws definida en awsConfig.client
    }

    async uploadImage(file: Express.Multer.File, userId: string): Promise<string>{
        const fileExtensionsByMimetype: { [key: string]: string } = {           //mapea el mimetype del archivo a su extension correspondiente. es para asegurarse que se esta subiendo en la extension correcta a su tipo
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/tiff': 'tiff',
            'image/bmp': 'bmp',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'video/ogg': 'ogg',
            'video/x-msvideo': 'avi',
          };
        
          try {
            const { mimetype } = file;          //se extrae el tipo de archivo del objeto file
            const extension = fileExtensionsByMimetype[mimetype] ?? 'file';     //se obtiene la extension del archivo usando el objeto fileExtensionsByMimetype. Si no se encuentra coincidencia, el valor por defecto va a ser file
            const key = `user_${userId}/${crypto.randomUUID()}.${extension}`;          //se crea un nombre unico para el archivo que se subira a s3. user_${userId} crea una carpeta dentro del id del usuario para organizar las imagenes. ${crypto.randomUUID()} genera un id unico para el archivo. extension, se obtiene segun el mimetype
            await this.s3Client.send(       //.send maneja la comunicacion con aws para cargar el archivo
              new PutObjectCommand({        //es una solicitud para poder subir un archivo a s3
                Bucket: awsConfig.s3.bucket,
                ContentType: mimetype,
                Key: key,
                Body: file.buffer,
              }),
            );
            return `https://${awsConfig.s3.bucket}.s3.${awsConfig.client.region}.amazonaws.com/${key}`;     //se construye la url publica de la imagen almacenada en s3
          } catch (err) {
            this.logger.error('Error uploading', (err as Error).stack);        //por si ocurre un error, el logger.error lo capturará. err.stack lo que va a hacer es mostrar la pila de llamadas del error (para que sea mas facil identificar el problema)
            throw err;
          }
    };

    async deleteImage(key: string): Promise<void> {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({   //Borra el objeto en el bucket de s3
            Bucket: awsConfig.s3.bucket,
            Key: key,
          }),
        )
      } catch (err) {
        this.logger.error('Error deleting image', (err as Error).stack);
        throw err;
      }
    }
}
