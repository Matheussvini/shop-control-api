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
  const { productId } = req.params;
  try {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).send({ message: 'No file uploaded' });
    }
    const { location, key } = req.file as MulterFileWithLocation;
    let url = '';

    if (location) url = location;
    else {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = req.file.filename;
      url = `${baseUrl}/uploads/${relativePath}`;
    }

    const image = await productService.persistImage(Number(productId), url, key);
    return res.status(httpStatus.CREATED).send({ message: 'Image sent successfully!', data: { ...image } });
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

export async function getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;

  try {
    const product = await productService.getById(Number(id));

    return res.status(httpStatus.OK).send(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { name, description, price, stock, status } = req.body;

  try {
    const updatedProduct = await productService.update(Number(id), { name, description, price, stock, status });

    return res.status(httpStatus.OK).send(updatedProduct);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;

  try {
    await productService.deleteById(Number(id));

    return res.status(httpStatus.NO_CONTENT).send(`Product with id ${id} deleted successfully`);
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { id } = req.params;

  try {
    await productService.deleteImage(Number(id));

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
}

interface MulterFileWithLocation extends Express.Multer.File {
  location: string;
  key: string;
}
