import fs from 'fs';
import path from 'path';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Prisma } from '@prisma/client';
import { productRepository } from '@/repositories';
import { CreateProductInput, GetAllProductsParams } from '@/schemas';
import { notFoundError } from '@/errors';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
});

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

async function update(id: number, data: Prisma.ProductUpdateInput) {
  return await productRepository.update(id, data);
}

async function deleteById(id: number) {
  return await productRepository.deleteById(id);
}

async function persistImage(productId: number, path: string, key: string) {
  const product = await getById(productId);
  if (!product) throw notFoundError('Product not found');
  return await productRepository.saveImage({ productId, path, key });
}

async function deleteImage(id: number) {
  const image = await productRepository.findImageById(id);
  if (!image) throw notFoundError('Image not found');

  if (image.key) {
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: image.key,
    };

    await s3.send(new DeleteObjectCommand(s3Params));
  } else {
    const filePath = path.resolve(process.cwd(), 'tmp', 'uploads', image.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return await productRepository.deleteImage(id);
}

export const productService = {
  create,
  getAll,
  getById,
  update,
  deleteById,
  persistImage,
  deleteImage,
};
