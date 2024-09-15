import { Router } from 'express';
import { authAdminValidation, authValidation } from '@/middlewares';
import { createOrder, getOrdersByClientId } from '@/controllers';

const ordersRouter = Router();

ordersRouter
  .all('/*', authValidation)
  .post('/', createOrder)
  .get('/:clientId', getOrdersByClientId)
  .all('/*', authAdminValidation);

export { ordersRouter };
