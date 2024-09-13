import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createClientSchema, getAllClientsSchema, updateClientSchema } from '@/schemas';
import { createClient, deleteClient, getAllClients, getClientById, updateClient } from '@/controllers';

const clientsRouter = Router();

clientsRouter
  .all('/*', authValidation)
  .post('/', validateBody(createClientSchema), createClient)
  .get('/:id', getClientById)
  .patch('/:id', validateBody(updateClientSchema), updateClient)
  .delete('/:id', deleteClient)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllClientsSchema), getAllClients);

export { clientsRouter };
