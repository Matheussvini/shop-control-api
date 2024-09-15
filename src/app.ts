import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { connectDb, disconnectDb, loadEnv } from '@/config';
import { cartsRouter, clientsRouter, ordersRouter, productsRouter, reportsRouter, usersRouter } from '@/routers';
import { handleApplicationErrors } from '@/middlewares';

loadEnv();

const app = express();
app
  .use(cors())
  .use(express.json())
  .use('/users', usersRouter)
  .use('/clients', clientsRouter)
  .use('/products', productsRouter)
  .use('/carts', cartsRouter)
  .use('/orders', ordersRouter)
  .use('/reports', reportsRouter)
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
