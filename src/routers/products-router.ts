import { Router } from 'express';
import { createProduct } from '@/controllers';
import { authAdminValidation, authValidation, validateBody } from '@/middlewares';
import { createProductSchema } from '@/schemas';

const productsRouter = Router();

productsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/', validateBody(createProductSchema), createProduct);

export { productsRouter };
