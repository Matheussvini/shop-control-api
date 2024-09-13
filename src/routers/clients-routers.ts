import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createClientSchema, getAllClientsSchema, updateClientSchema } from '@/schemas';
import { createClient, getAllClients, getClientById, updateClient } from '@/controllers';

const clientsRouter = Router();

clientsRouter
  .all('/*', authValidation)
  .post('/', validateBody(createClientSchema), createClient)
  .get('/:id', getClientById)
  .patch('/:id', validateBody(updateClientSchema), updateClient)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllClientsSchema), getAllClients);

export { clientsRouter };
