import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function create(data: Prisma.ProductCreateInput) {
  return await prisma.product.create({
    data,
  });
}

export const productRepository = {
  create,
};
