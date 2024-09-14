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

export async function uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { location, key } = req.file as MulterFileWithLocation;
  let url = '';
  if (location) url = location;
  else {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = req.file.filename;
    url = `${baseUrl}/uploads/${relativePath}`;
  }

  try {
    return res.status(httpStatus.CREATED).send({ message: 'Image sent successfully!', data: { url, key } });
  } catch (error) {
    next(error);
  }
}

interface MulterFileWithLocation extends Express.Multer.File {
  location: string;
  key: string;
}
