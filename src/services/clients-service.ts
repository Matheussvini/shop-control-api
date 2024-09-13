import { Client } from '@prisma/client';
import { conflictError } from '@/errors';
import { CreateClientInput } from '@/schemas';
import { clientRepository } from '@/repositories';

async function validateUniqueClient(userId: number): Promise<void> {
  const checkClient = await clientRepository.findByUserId(userId);
  if (checkClient) throw conflictError('Client already exists for this user');
}

async function create(data: CreateClientInput): Promise<Client> {
  await validateUniqueClient(data.userId);

  const client = await clientRepository.createClientWithAddress(data);

  return client;
}

export const clientService = {
  create,
};
