import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { connectDb, disconnectDb, loadEnv } from '@/config';
import { clientsRouter, productsRouter, usersRouter } from '@/routers';
import { handleApplicationErrors } from '@/middlewares';

loadEnv();

const app = express();
app
  .use(cors())
  .use(express.json())
  .use('/users', usersRouter)
  .use('/clients', clientsRouter)
  .use('/products', productsRouter)
  .use('/uploads', express.static(path.resolve(process.cwd(), 'tmp', 'uploads')))
  .use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDb();
}

export default app;
