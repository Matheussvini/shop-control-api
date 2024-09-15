import { Prisma } from '@prisma/client';
import { cartsService } from './carts-service';
import { notFoundError, unauthorizedError } from '@/errors';
import { clientRepository, ordersRepository } from '@/repositories';
import { SecuryUser } from '@/middlewares';
import { GetAllOrdersParams } from '@/schemas';

async function create(user: SecuryUser) {
  const client = await clientRepository.findByUserId(user.id);
  if (!client) throw notFoundError('Client not found');

  const { total, clientId, cart } = await cartsService.getCart(client.id);
  if (!cart.length) throw notFoundError('Shopping cart is empty');
  const order = await ordersRepository.create({ clientId, total, cart });

  return order;
}

async function getByClientId(userId: number) {
  return await ordersRepository.findByClientId(userId);
}

async function getById(id: number, user: SecuryUser) {
  const order = await ordersRepository.findById(id);

  if (!order) throw notFoundError('Order not found');
  if (user.type !== 'admin' && order.Client.userId !== user.id)
    throw unauthorizedError('You are not allowed to access orders from other users');
  delete order.Client;

  return order;
}

async function getAll({ page, limit, status, minTotal, maxTotal, minDate, maxDate }: GetAllOrdersParams) {
  const offset = (page - 1) * limit;
  const filters: Prisma.OrderWhereInput = {};

  if (status) filters.status = { equals: status };
  if (minTotal) filters.total = { gte: minTotal };
  if (maxTotal) filters.total = { lte: maxTotal };
  if (minDate) filters.createdAt = { gte: new Date(minDate) };
  if (maxDate) filters.createdAt = { lte: new Date(maxDate) };

  const [orders, total] = await Promise.all([
    ordersRepository.findMany({
      skip: offset,
      take: limit,
      where: filters,
    }),
    ordersRepository.count(filters),
  ]);

  return { data: orders, total, page, limit };
}

export const ordersService = {
  create,
  getByClientId,
  getById,
  getAll,
};
