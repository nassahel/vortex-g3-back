import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

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
