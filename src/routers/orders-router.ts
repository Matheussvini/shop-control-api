import { Router } from 'express';
import { authAdminValidation, authValidation, validateQuery } from '@/middlewares';
import { createOrder, getAllOrders, getOrderById, getOrdersByClientId } from '@/controllers';
import { getAllOrdersSchema } from '@/schemas';

const ordersRouter = Router();

ordersRouter
  .all('/*', authValidation)
  .post('/', createOrder)
  .get('/client/:clientId', getOrdersByClientId)
  .get('/:id', getOrderById)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllOrdersSchema), getAllOrders);

export { ordersRouter };
