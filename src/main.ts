import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as FirebaseAdmin from 'firebase-admin';

import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter } from './httpException.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  const fcmConfig: FirebaseAdmin.ServiceAccount = {
    projectId: configService.get<string>('FCM_PROJECT_ID'),
    privateKey: configService.get<string>('FCM_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FCM_CLIENT_EMAIL'),
  };

  FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert(fcmConfig),
  });

  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
