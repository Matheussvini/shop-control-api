import { Router } from 'express';
import multer from 'multer';
import { createProduct, uploadFile } from '@/controllers';
import { authAdminValidation, authValidation, validateBody } from '@/middlewares';
import { createProductSchema } from '@/schemas';
import { multerConfig } from '@/config';

const productsRouter = Router();

productsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/', validateBody(createProductSchema), createProduct)
  // .post('/upload', multer(multerConfig).single('file'), uploadFile);
  .post(
    '/upload',
    multer(multerConfig).single('file'),
    (req, res, next) => {
      console.log(req.file); // Veja o que está sendo logado aqui
      next();
    },
    uploadFile,
  );

export { productsRouter };
