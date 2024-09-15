import { Router } from 'express';
import { changeProductInCart, getAllCarts, getCart } from '@/controllers';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { addProductToCartSchema, getAllCartsSchema } from '@/schemas';

const cartsRouter = Router();

cartsRouter
  .all('/*', authValidation)
  .post('/', validateBody(addProductToCartSchema), changeProductInCart)
  .get('/:clientId', getCart)
  .all('/*', authAdminValidation)
  .get('/', validateQuery(getAllCartsSchema), getAllCarts);

export { cartsRouter };
