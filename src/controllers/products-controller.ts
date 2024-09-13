import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { productService } from '@/services';

export async function createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { name, description, price, stock } = req.body;

  try {
    const product = await productService.create({
      name,
      description,
      price,
      stock,
    });
    return res.status(httpStatus.CREATED).send(product);
  } catch (error) {
    next(error);
  }
}
