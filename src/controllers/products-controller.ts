import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { productService } from '@/services';
import { GetAllProductsParams } from '@/schemas';

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

export async function getAllProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { page = 1, limit = 10, name, description, minPrice, maxPrice, minStock, maxStock, status } = req.query;

  try {
    const filters: GetAllProductsParams = {
      page: Number(page),
      limit: Number(limit),
      name: name as string,
      description: description as string,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      minStock: Number(minStock),
      maxStock: Number(maxStock),
    };
    if (status === 'true') filters.status = true;
    else if (status === 'false') filters.status = false;

    const products = await productService.getAll(filters);

    return res.status(httpStatus.OK).send(products);
  } catch (error) {
    next(error);
  }
}

interface MulterFileWithLocation extends Express.Multer.File {
  location: string;
  key: string;
}
