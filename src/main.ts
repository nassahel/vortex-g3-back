import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Abrilo completo para que no falle por CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  app.setGlobalPrefix('api/v1', {
    exclude: ['api-docs'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  const PORT = process.env.PORT || 3000;  
  const NODE_ENV = process.env.NODE_ENV || 'development';

  Logger.log(`🚀 Starting app in ${NODE_ENV} mode`, 'Bootstrap');
  Logger.log(`🚀 Listening on port ${PORT}`, 'Bootstrap');

  await app.listen(PORT);

  Logger.log(`🚀 App ready and listening on port ${PORT}`, 'Bootstrap');
}
bootstrap();

bootstrap();
