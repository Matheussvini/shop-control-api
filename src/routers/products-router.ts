import { Router } from 'express';
import multer from 'multer';
import { createProduct, getAllProducts, uploadFile } from '@/controllers';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createProductSchema, getAllProductsSchema } from '@/schemas';
import { multerConfig } from '@/config';

const productsRouter = Router();

productsRouter
  .all('/*', authValidation)
  .get('/', validateQuery(getAllProductsSchema), getAllProducts)
  .all('/*', authAdminValidation)
  .post('/', validateBody(createProductSchema), createProduct)
  .post('/upload', multer(multerConfig).single('file'), uploadFile);

export { productsRouter };
