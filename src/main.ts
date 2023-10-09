import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  configSwagger(app);

  await app.listen(process.env.APP_PORT || 3001, () => {
    console.log(`App listening in ${process.env.APP_PORT || 3001}`);
  });
}
bootstrap();

function configSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CineWorld')
    .setDescription('CineWorld APIs document')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
