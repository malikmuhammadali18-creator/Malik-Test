import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import serverlessHttp from 'serverless-http';
import { AppModule } from '../eduresource-api/src/app.module';
import { configureApp } from '../eduresource-api/src/bootstrap';

const expressApp = express();
let handlerPromise: Promise<ReturnType<typeof serverlessHttp>> | null = null;

async function createHandler() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  await configureApp(app);
  await app.init();
  return serverlessHttp(expressApp);
}

export default async function handler(req: unknown, res: unknown) {
  if (!handlerPromise) {
    handlerPromise = createHandler();
  }
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(req, res);
}
