import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createClientSchema, getAllClientsSchema } from '@/schemas';
import { createClient, getAllClients, getClientById } from '@/controllers';

const clientsRouter = Router();

clientsRouter
  .all('/*', authValidation)
  .post('/', validateBody(createClientSchema), createClient)
  .get('/:id', getClientById)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllClientsSchema), getAllClients);

export { clientsRouter };
