import { Router } from 'express';
import { authAdminValidation, authValidation, validateParams, validateQuery } from '@/middlewares';
import {
  createOrder,
  deleteOrder,
  doPayment,
  getAllOrders,
  getOrderById,
  getOrdersByClientId,
  updateOrderStatus,
} from '@/controllers';
import { getAllOrdersSchema, updateStatusSchema } from '@/schemas';

const ordersRouter = Router();

ordersRouter
  .all('/*', authValidation)
  .post('/', createOrder)
  .get('/:id', getOrderById)
  .get('/client/:clientId', getOrdersByClientId)
  .post('/payment/:orderId', doPayment)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllOrdersSchema), getAllOrders)
  .patch('/status/:orderId/:status', validateParams(updateStatusSchema), updateOrderStatus)
  .delete('/:id', deleteOrder);

export { ordersRouter };
