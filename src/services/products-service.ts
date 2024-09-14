import { Prisma } from '@prisma/client';
import { productRepository } from '@/repositories';
import { CreateProductInput, GetAllProductsParams } from '@/schemas';
import { notFoundError } from '@/errors';

async function create(data: CreateProductInput) {
  const product = await productRepository.create(data);

  return product;
}

async function getAll({
  page,
  limit,
  name,
  description,
  minPrice,
  maxPrice,
  minStock,
  maxStock,
  status,
}: GetAllProductsParams) {
  const offset = (page - 1) * limit;
  const filters: Prisma.ProductWhereInput = {};

  if (name) filters.name = { contains: name, mode: 'insensitive' };
  if (description) filters.description = { contains: description, mode: 'insensitive' };
  if (minPrice) filters.price = { gte: minPrice };
  if (maxPrice) filters.price = { lte: maxPrice };
  if (minStock) filters.stock = { gte: minStock };
  if (maxStock) filters.stock = { lte: maxStock };
  if (status || status === false) filters.status = status;

  const [products, total] = await Promise.all([
    productRepository.findMany({
      skip: offset,
      take: limit,
      where: filters,
    }),
    productRepository.count(filters),
  ]);

  return { data: products, total, page, limit };
}

async function getById(id: number) {
  const product = await productRepository.findById(id);
  if (!product) throw notFoundError('Product not found');
  return product;
}

export const productService = {
  create,
  getAll,
  getById,
};
