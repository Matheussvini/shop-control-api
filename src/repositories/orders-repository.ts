import { cartsRepository } from './carts-repository';
import { prisma } from '@/config';

async function create({ total, clientId, cart }) {
  return await prisma.$transaction(async (prisma) => {
    const order = await prisma.order.create({
      data: {
        total: Number(total),
        Client: {
          connect: {
            id: clientId,
          },
        },
        Items: {
          createMany: {
            data: cart.map((item) => ({
              quantity: item.quantity,
              price: item.Product.price,
              subtotal: item.subtotal,
              productId: item.productId,
            })),
          },
        },
      },
    });

    cart.forEach(async (item) => {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    });

    await cartsRepository.clearCart(clientId);
    return order;
  });
}

async function findByClientId(clientId: number) {
  return await prisma.order.findMany({
    where: {
      Client: {
        id: clientId,
      },
    },
    include: {
      Items: {
        select: {
          quantity: true,
          subtotal: true,
          Product: {
            select: {
              name: true,
              price: true,
              Images: {
                select: { path: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

export const ordersRepository = {
  create,
  findByClientId,
};
