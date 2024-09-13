import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createClientSchema, getAllClientsSchema } from '@/schemas';
import { createClient, getAllClients } from '@/controllers';

const clientsRouter = Router();

clientsRouter
  .all('/*', authValidation)
  .post('/', validateBody(createClientSchema), createClient)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllClientsSchema), getAllClients);

export { clientsRouter };
