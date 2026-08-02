import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import serverlessHttp from 'serverless-http';
import { AppModule } from '../eduresource-api/src/app.module';
import { configureApp } from '../eduresource-api/src/bootstrap';

const expressApp = express();
let cachedHandler: any = null;

async function createHandler() {
  if (cachedHandler) return cachedHandler;

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  await configureApp(app);
  await app.init();

  cachedHandler = serverlessHttp(expressApp, {
    binary: ['application/octet-stream', 'image/*', 'font/*'],
  });
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const serverlessHandler = await createHandler();
  return serverlessHandler(req, res);
}
