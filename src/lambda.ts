import { Server } from 'http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import * as express from 'express';
import { Handler, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

let cachedServer: Server;

const binaryMimeTypes: string[] = [];

const bootstrapServer = async (): Promise<Server> => {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  app.use(eventContext());
  app.enableCors();

  setupSwagger(app);
  await app.init();
  return createServer(expressApp, undefined, binaryMimeTypes);
};

export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
