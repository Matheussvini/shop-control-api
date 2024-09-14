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

export async function getAllCarts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { page = 1, limit = 10, minDate, maxDate, minPrice, maxPrice, productName } = req.query;

  try {
    const filters = {
      page: Number(page),
      limit: Number(limit),
      minDate: minDate as string,
      maxDate: maxDate as string,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      productName: productName as string,
    };

    const carts = await cartsService.getAll(filters);

    return res.status(httpStatus.OK).send(carts);
  } catch (error) {
    next(error);
  }
}
