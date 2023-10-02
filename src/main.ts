import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.APP_PORT || 3001, () => {
    console.log(`App listening in ${process.env.APP_PORT || 3001}`);
  });
}
bootstrap();
