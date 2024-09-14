import { Router } from 'express';
import { changeProductInCart, getAllCarts, getCart } from '@/controllers';
import { authAdminValidation, authValidation, validateBody, validateParams } from '@/middlewares';
import { addProductToCartSchema, getAllCartsSchema } from '@/schemas';

const cartsRouter = Router();

cartsRouter
  .all('/*', authValidation)
  .post('/', validateBody(addProductToCartSchema), changeProductInCart)
  .get('/:clientId', getCart)
  .all('/*', authAdminValidation)
  .get('/', validateParams(getAllCartsSchema), getAllCarts);

export { cartsRouter };
