import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as FirebaseAdmin from 'firebase-admin';

import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { HttpExceptionFilter } from './httpException.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggerService));

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
  app.useGlobalFilters(new HttpExceptionFilter(app.get(LoggerService)));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// bootstrap();

let server: Handler;

const handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

exports.handler = handler;
