import { Router } from 'express';
import { changeProductInCart, getCart } from '@/controllers';
import { authAdminValidation, authValidation, validateBody } from '@/middlewares';
import { addProductToCartSchema } from '@/schemas';

const cartsRouter = Router();

cartsRouter
  .all('/*', authValidation)
  .post('/', validateBody(addProductToCartSchema), changeProductInCart)
  .get('/:clientId', getCart)
  .all('/*', authAdminValidation);

export { cartsRouter };
