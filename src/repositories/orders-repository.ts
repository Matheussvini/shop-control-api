import { Prisma } from '@prisma/client';
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

    // cart.forEach(async (item) => {
    //   await prisma.product.update({
    //     where: { id: item.productId },
    //     data: { stock: { decrement: item.quantity } },
    //   });
    // });

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

async function findById(id: number) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      Client: {
        select: {
          userId: true,
        },
      },
      Items: {
        select: {
          quantity: true,
          price: true,
          subtotal: true,
          Product: {
            select: {
              name: true,
              description: true,
              Images: {
                select: { path: true },
              },
            },
          },
        },
      },
    },
  });
}

async function findMany(params) {
  return await prisma.order.findMany({
    ...params,
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

async function count(where: Prisma.OrderWhereInput) {
  return prisma.order.count({ where });
}

export const ordersRepository = {
  create,
  findByClientId,
  findById,
  findMany,
  count,
};
