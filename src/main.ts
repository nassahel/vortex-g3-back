import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/swagger';
import * as dotenv from 'dotenv';
import { I18nValidationPipe } from 'nestjs-i18n';
import { ValidationsExceptionFilter } from './common/middlewares';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['api-docs'],
  });
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);
  app.useGlobalFilters(new ValidationsExceptionFilter());

  const configService = app.get(ConfigService);
  const PORT = process.env.PORT;
  const NODE_ENV = configService.get<string>('NODE_ENV');

  await app.listen(PORT, () => {
    Logger.log(
      `Application running the port: http://localhost:${PORT}`,
      NestApplication.name,
    );
    Logger.log(`Current enviroment: ${NODE_ENV}`, NestApplication.name);
  });
}
bootstrap();
