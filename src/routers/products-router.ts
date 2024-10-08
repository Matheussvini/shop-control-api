import { Router } from 'express';
import multer from 'multer';
import {
  createProduct,
  deleteImage,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  uploadFile,
} from '@/controllers';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { createProductSchema, getAllProductsSchema, updateProductSchema } from '@/schemas';
import { multerConfig } from '@/config';

const productsRouter = Router();

productsRouter
  .all('/*', authValidation)
  .get('/', validateQuery(getAllProductsSchema), getAllProducts)
  .get('/:id', getProductById)
  .all('/*', authAdminValidation)
  .post('/', validateBody(createProductSchema), createProduct)
  .patch('/:id', validateBody(updateProductSchema), updateProduct)
  .delete('/:id', deleteProduct)
  .post('/upload/:productId', multer(multerConfig).single('file'), uploadFile)
  .delete('/image/:id', deleteImage);

export { productsRouter };
