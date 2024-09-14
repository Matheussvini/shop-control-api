import { prisma } from '@/config';
import { ChangeProductToCartInput } from '@/schemas';

async function findProduct(data: Omit<ChangeProductToCartInput, 'quantity'>) {
  return await prisma.cartItem.findFirst({
    where: data,
  });
}

async function addProduct(data: ChangeProductToCartInput) {
  return await prisma.cartItem.create({
    data,
    select: { clientId: true, productId: true, quantity: true },
  });
}

async function updateProduct({ id, quantity }) {
  return await prisma.cartItem.update({
    where: { id },
    select: { clientId: true, productId: true, quantity: true },
    data: { quantity },
  });
}

async function removeProduct(id: number) {
  return await prisma.cartItem.delete({
    where: { id },
  });
}

async function getCart(clientId: number) {
  return await prisma.cartItem.findMany({
    where: { clientId },
    select: {
      productId: true,
      quantity: true,
      Product: {
        select: {
          name: true,
          price: true,
          stock: true,
          Images: {
            select: {
              path: true,
            },
          },
        },
      },
    },
  });
}

export const cartsRepository = {
  addProduct,
  findProduct,
  updateProduct,
  removeProduct,
  getCart,
};
