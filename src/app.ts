import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { connectDb, disconnectDb, loadEnv } from '@/config';
import {
  cartsRouter,
  clientsRouter,
  ordersRouter,
  productsRouter,
  reportsRouter,
  swaggerRouter,
  usersRouter,
} from '@/routers';
import { handleApplicationErrors } from '@/middlewares';

loadEnv();

const app = express();
app
  .use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use(express.json())
  .use('/users', usersRouter)
  .use('/clients', clientsRouter)
  .use('/products', productsRouter)
  .use('/carts', cartsRouter)
  .use('/orders', ordersRouter)
  .use('/reports', reportsRouter)
  .use('/uploads', express.static(path.resolve(process.cwd(), 'tmp', 'uploads')))
  .use('/swagger', swaggerRouter)
  .get('/doc', (req, res) => {
    res.redirect('https://github.com/Matheussvini/shop-control-api#readme'); // Redireciona para o README do GitHub
  })
  .use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDb();
}

export default app;
