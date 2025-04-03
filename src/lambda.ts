import { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });
  await app.init();

  return createServer(expressApp);
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
) => {
  try {
    if (!cachedServer) {
      console.log('Starting server...');

      cachedServer = await bootstrap();
    }

    return proxy(cachedServer, event, context, 'PROMISE').promise;
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};
