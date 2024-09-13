import express, { Express } from 'express';
import cors from 'cors';
import { connectDb, disconnectDb, loadEnv } from '@/config';
import { usersRouter } from '@/routers';
import { handleApplicationErrors } from '@/middlewares';

loadEnv();

const app = express();
app.use(cors()).use(express.json()).use('/users', usersRouter).use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDb();
}

export default app;
