import { Router } from 'express';
import { authAdminValidation, authValidation, validateQuery } from '@/middlewares';
import { createOrder, doPayment, getAllOrders, getOrderById, getOrdersByClientId } from '@/controllers';
import { getAllOrdersSchema } from '@/schemas';

const ordersRouter = Router();

ordersRouter
  .all('/*', authValidation)
  .post('/', createOrder)
  .get('/:id', getOrderById)
  .get('/client/:clientId', getOrdersByClientId)
  .post('/payment/:orderId', doPayment)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllOrdersSchema), getAllOrders);

export { ordersRouter };
