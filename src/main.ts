import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  //Configuracion de las rutas generales. ahora a todas las rutas hay quie ponerle eso de api/v1 antes de lo que corresponda.
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

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
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
