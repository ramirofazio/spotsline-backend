import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { TestDbCloudService } from './test-db-cloud/test-db-cloud.service';
import mobbex from 'mobbex';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.enableCors({
    origin: env.ACCESS_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useBodyParser('json', { limit: '20mb' });
  const config = new DocumentBuilder()
    .setTitle('SPT API')
    .setDescription('Documentación de cada ruta, que requiere y que retorna :)')
    .setVersion('1.0')
    .addTag('SPT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docu', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      //? Deja pasar solo la info explicitamente declarada en los DTO's
      whitelist: true,
      //? Permite que se modifique data de acuerdo a un DTO -> return new DTO(data)
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  mobbex.configurations.configure({
    apiKey: process.env.MOBBEX_X_API_KEY,
    accessToken: process.env.MOBBEX_X_ACCESS_TOKEN,
  });
  await app.listen(3000);
  await app.get(TestDbCloudService).testDb();
}
bootstrap();
