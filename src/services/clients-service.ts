import { Client, Prisma } from '@prisma/client';
import { conflictError, notFoundError } from '@/errors';
import { CreateClientInput } from '@/schemas';
import { clientRepository, userRepository } from '@/repositories';
import { Pagination } from '@/types';

async function validateUniqueClient(userId: number): Promise<void> {
  const checkClient = await clientRepository.findByUserId(userId);
  if (checkClient) throw conflictError('Client already exists for this user');
}

async function create(data: CreateClientInput): Promise<Client> {
  const { userId } = data;

  const user = await userRepository.findById(userId);
  if (!user) throw notFoundError('User not found');

  await validateUniqueClient(userId);

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

async function getById(id: number) {
  const client = await clientRepository.findById(id);
  if (!client) throw notFoundError('Client not found');
  return client;
}

async function update(id: number, data: Prisma.ClientUpdateInput) {
  await getById(id);
  return await clientRepository.update(id, data);
}

async function deleteById(id: number) {
  await getById(id);
  return await clientRepository.deleteById(id);
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
  update,
  deleteById,
};
