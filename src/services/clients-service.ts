import { Client, Prisma, User } from '@prisma/client';
import { conflictError, notFoundError, unauthorizedError } from '@/errors';
import { CreateClientInput } from '@/schemas';
import { clientRepository } from '@/repositories';
import { Pagination } from '@/types';
import { SecuryUser } from '@/middlewares';

async function validateUniqueClient(userId: number): Promise<void> {
  const checkClient = await clientRepository.findByUserId(userId);
  if (checkClient) throw conflictError('Client already exists for this user');
}

async function create(data: CreateClientInput): Promise<Client> {
  await validateUniqueClient(data.userId);

  const client = await clientRepository.createClientWithAddress(data);

  return client;
}

async function getAll({ page, limit, fullName, contact, status }: GetAllClientsParams) {
  const offset = (page - 1) * limit;
  const filters: Prisma.ClientWhereInput = {};

  if (fullName) filters.fullName = { contains: fullName, mode: 'insensitive' };
  if (contact) filters.contact = { contains: contact };
  if (status || status === false) filters.status = status;

  const [clients, total] = await Promise.all([
    clientRepository.findMany({
      skip: offset,
      take: limit,
      where: filters,
    }),
    clientRepository.count(filters),
  ]);

  return { data: clients, total, page, limit };
}

async function validateUser(clientId: number, user: SecuryUser) {
  const client = await clientRepository.findByUserId(user.id);
  if (user.type !== 'admin' && client?.id !== clientId)
    throw unauthorizedError("You don't have permission to access other user");
}

async function getById(id: number, user: SecuryUser) {
  await validateUser(id, user);

  const client = await clientRepository.findById(id);
  if (!client) throw notFoundError('Client not found');
  return client;
}

export type GetAllClientsParams = Pagination & {
  fullName?: string;
  contact?: string;
  status?: boolean;
};

export const clientService = {
  create,
  getAll,
  getById,
};
