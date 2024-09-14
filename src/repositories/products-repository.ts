import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function create(data: Prisma.ProductCreateInput) {
  return await prisma.product.create({
    data,
  });
}

async function findMany(params: FindManyParams) {
  return await prisma.product.findMany({
    ...params,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      status: true,
    },
  });
}

async function count(where?: Prisma.ProductWhereInput) {
  return prisma.product.count({ where });
}

async function findById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

type FindManyParams = {
  skip?: number;
  take?: number;
  where?: Prisma.ProductWhereInput;
};

export const productRepository = {
  create,
  findMany,
  count,
  findById,
};
