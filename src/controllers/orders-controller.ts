import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { validateClient } from './clients-controller';
import { AuthenticatedRequest } from '@/middlewares';
import { ordersService } from '@/services';

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { user } = req;

  try {
    const order = await ordersService.create(user);
    return res.status(httpStatus.CREATED).send({ message: 'Order created successfully!', data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersByClientId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  const { clientId } = req.params;
  const { user } = req;

  try {
    await validateClient(Number(clientId), user);
    const orders = await ordersService.getByClientId(Number(clientId));
    return res.status(httpStatus.OK).send(orders);
  } catch (error) {
    next(error);
  }
}
