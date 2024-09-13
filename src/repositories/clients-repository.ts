import { PrismaClient } from '@prisma/client';
import { CreateClientInput } from '@/schemas';

const prisma = new PrismaClient();

async function findByUserId(userId: number) {
  return await prisma.client.findFirst({
    where: { userId },
  });
}

async function updateAddressesStatusToFalse(clientId: number) {
  await prisma.address.updateMany({
    where: { clientId },
    data: { status: false },
  });
}

async function createClientWithAddress(data: CreateClientInput) {
  return await prisma.$transaction(async (prisma) => {
    await updateAddressesStatusToFalse(data.userId);

    const { address, ...clientData } = data;

    const client = await prisma.client.create({
      data: clientData,
    });

    const newAddress = await prisma.address.create({
      data: { ...address, clientId: client.id },
    });

    return { ...client, address: newAddress };
  });
}

export const clientRepository = {
  findByUserId,
  updateAddressesStatusToFalse,
  createClientWithAddress,
};
