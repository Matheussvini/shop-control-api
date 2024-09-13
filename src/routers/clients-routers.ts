import { Router } from 'express';
import { authValidation, validateBody } from '@/middlewares';
import { createClientSchema } from '@/schemas';
import { createClient } from '@/controllers';

const clientsRouter = Router();

clientsRouter.all('/*', authValidation).post('/', validateBody(createClientSchema), createClient);

export { clientsRouter };
