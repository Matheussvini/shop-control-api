import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function create(data: Prisma.ProductCreateInput) {
  return await prisma.product.create({
    data,
  });
}

async function findMany(params: FindManyParams) {
  const products = await prisma.product.findMany({
    ...params,
    include: {
      Images: {
        select: {
          path: true,
        },
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    ...product,
    imageUrl: product.Images.length > 0 ? product.Images[0].path : null,
    Images: undefined,
  }));
}

async function count(where?: Prisma.ProductWhereInput) {
  return prisma.product.count({ where });
}

async function findById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      Images: {
        select: {
          id: true,
          path: true,
        },
      },
    },
  });
}

async function findStockById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
    select: {
      stock: true,
      status: true,
    },
  });
}

async function update(id: number, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

async function deleteById(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}

async function saveImage(data: SaveImageParams) {
  return prisma.image.create({
    data,
    select: {
      path: true,
    },
  });
}

async function findImageById(id: number) {
  return prisma.image.findUnique({
    where: { id },
  });
}

async function deleteImage(id: number) {
  return prisma.image.delete({
    where: { id },
  });
}

export type FindManyParams = {
  skip?: number;
  take?: number;
  where?: Prisma.ProductWhereInput;
};

export type SaveImageParams = {
  productId: number;
  path: string;
  key: string;
};

export const productRepository = {
  create,
  findMany,
  count,
  findById,
  update,
  deleteById,
  saveImage,
  findImageById,
  deleteImage,
  findStockById,
};
