import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app): void => {
  const config = new DocumentBuilder()
    .setTitle('Backend LuxShop')
    .setDescription(`LuxShop es una plataforma de comercio electrónico que permite a los usuarios 
  explorar, comprar y vender productos en línea.  
   La API gestiona operaciones de productos, usuarios y pedidos.  
   La API está construida con NestJS y usa PostgreSQL.
    `)
    .setVersion('1.4')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Ruta para acceder a la documentación de Swagger: http://localhost:8000/api
};

