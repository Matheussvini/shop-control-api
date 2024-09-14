import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { validateClient } from './clients-controller';
import { AuthenticatedRequest } from '@/middlewares';
import { cartsService } from '@/services';

export async function changeProductInCart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  const { clientId, productId, quantity } = req.body;
  const { user } = req;

  try {
    await validateClient(Number(clientId), user);
    const result = await cartsService.changeProduct({ clientId, productId, quantity });

    return res.status(httpStatus.CREATED).send({ ...result });
  } catch (error) {
    next(error);
  }
}

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { clientId } = req.params;
  const { user } = req;
  try {
    await validateClient(Number(clientId), user);
    const cart = await cartsService.getCart(Number(clientId));

    return res.status(httpStatus.OK).send(cart);
  } catch (error) {
    next(error);
  }
}
