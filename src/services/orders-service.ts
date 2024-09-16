import { Prisma, $Enums } from '@prisma/client';
import { cartsService } from './carts-service';
import { badRequestError, conflictError, notFoundError, unauthorizedError } from '@/errors';
import { clientRepository, ordersRepository, productRepository } from '@/repositories';
import { SecuryUser } from '@/middlewares';
import { GetAllOrdersParams } from '@/schemas';

async function create(user: SecuryUser) {
  const client = await clientRepository.findByUserId(user.id);
  if (!client) throw notFoundError('Client not found');

  const { total, clientId, cart } = await cartsService.getCart(client.id);
  if (!cart.length) throw notFoundError('Shopping cart is empty');

  await validateCartStock(cart);

  const order = await ordersRepository.create({ clientId, total, cart });
  return order;
}

async function validateCartStock(cart) {
  for (const item of cart) {
    const product = item.Product;
    if (product.status === false) {
      throw conflictError(`Product "${product.name}" is unavailable`);
    }
    if (product.stock < item.quantity) {
      throw conflictError(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
      );
    }
  }
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

async function simulatePayment(orderId: number) {
  const order = await ordersRepository.findById(orderId);
  if (!order) throw notFoundError('Order not found');
  if (order.status !== 'RECEBIDO') throw badRequestError('Order has already been paid');

  const isPaymentApproved = Math.random() < 0.8;
  return { success: isPaymentApproved };
}

async function paymentDone(orderId: number) {
  return await ordersRepository.completePayment(orderId, 'EM_PREPARACAO');
}

async function checkStockAvailability(items: { productId: number; quantity: number }[]) {
  const insufficientStockItems = [];

  for (const item of items) {
    const product = await productRepository.findStockById(item.productId);

    if (!product) insufficientStockItems.push({ productId: item.productId, reason: 'Product not found' });
    else if (!product.status) insufficientStockItems.push({ productId: item.productId, reason: 'Product is disabled' });
    else if (product.stock < item.quantity) {
      insufficientStockItems.push({
        productId: item.productId,
        reason: 'Insufficient stock',
        availableStock: product ? product.stock : 0,
        requestedQuantity: item.quantity,
      });
    }
  }

  if (insufficientStockItems.length > 0) {
    throw conflictError(`Payment failed because some products have any problem`, insufficientStockItems);
  }
}

async function updateStatus(orderId: number, status: $Enums.OrderStatus) {
  const order = await ordersRepository.findById(orderId);
  if (!order) throw notFoundError('Order not found');
  if (order.status === status) throw badRequestError('Order already has this status');

  return await ordersRepository.updateStatus(orderId, status);
}

async function exclude(orderId: number) {
  const order = await ordersRepository.findById(orderId);
  if (!order) throw notFoundError('Order not found');

  return await ordersRepository.deleteById(orderId);
}

export const ordersService = {
  create,
  getByClientId,
  getById,
  getAll,
  simulatePayment,
  paymentDone,
  checkStockAvailability,
  updateStatus,
  exclude,
};
