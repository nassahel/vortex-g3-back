import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Configuracion de las rutas generales. ahora a todas las rutas hay quie ponerle eso de api/v1 antes de lo que corresponda.
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  const NODE_ENV = configService.get<string>('NODE_ENV');


  await app.listen(PORT, () => {
    Logger.log(`Application running the port: http://localhost:${PORT}`, NestApplication.name);
    Logger.log(`Current enviroment: ${NODE_ENV}`, NestApplication.name);
  })

}
bootstrap();
