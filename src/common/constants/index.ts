// import * as dotenv from 'dotenv';
// dotenv.config();

const env = process.env;

export enum RoleEnum {
    ADMIN = 'ADMIN',
    USER = 'USER',
  }
  
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();


// CONSTANTES AWS
export const awsConfig = {
  client: {
    region: configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  },
  s3: {
    bucket: configService.get('AWS_BUCKET'),
  },
};



//CONSTANTES MAILJET
  export const messagingConfig = {
    emailSender: env.EMAIL_SENDER,
    apiKey: env.MAILJET_API_KEY,
    secret: env.MAILJET_SECRET_KEY,
    resetPasswordUrls: {
      backoffice: env.BACKOFFICE_RESET_PASSWORD_URL,
    },
  };