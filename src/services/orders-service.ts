import { cartsService } from './carts-service';
import { notFoundError } from '@/errors';
import { clientRepository, ordersRepository } from '@/repositories';
import { SecuryUser } from '@/middlewares';

async function create(user: SecuryUser) {
  const client = await clientRepository.findByUserId(user.id);
  if (!client) throw notFoundError('Client not found');

  const { total, clientId, cart } = await cartsService.getCart(client.id);
  if (!cart.length) throw notFoundError('Shopping cart is empty');
  const order = await ordersRepository.create({ clientId, total, cart });

  return order;
}

export const ordersService = {
  create,
};
