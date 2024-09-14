import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ordersService } from '@/services';

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { user } = req;

  try {
    const order = await ordersService.create(user);
    return res.status(httpStatus.CREATED).send(order);
  } catch (error) {
    next(error);
  }
}
