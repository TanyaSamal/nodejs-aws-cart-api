import { NestFactory } from '@nestjs/core';
import { configure } from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

import { AppModule } from './app.module';

let server: Handler;
const port = process.env.APP_PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return configure({ app: expressApp });
}

export const handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  try {
    console.log(`Starting server on port ${port}`);

    if (!server) {
      server = await bootstrap();
    }

    return await server(event, context, callback);

  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};
