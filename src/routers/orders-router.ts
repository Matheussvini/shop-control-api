import { Router } from 'express';
import { authAdminValidation, authValidation } from '@/middlewares';
import { createOrder } from '@/controllers';

const ordersRouter = Router();

ordersRouter.all('/*', authValidation).post('/', createOrder).all('/*', authAdminValidation);

export { ordersRouter };
