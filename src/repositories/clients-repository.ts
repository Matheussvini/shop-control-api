import { Prisma, PrismaClient } from '@prisma/client';
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

async function findMany(params: FindManyParams) {
  return await prisma.client.findMany({
    ...params,
    select: {
      id: true,
      fullName: true,
      contact: true,
      status: true,
    },
  });
}

async function findById(id: number) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      Addresses: {
        where: { status: true },
        take: 1,
      },
    },
  });

  const { Addresses, ...clientData } = client;
  return {
    ...clientData,
    address: Addresses[0] || null,
  };
}

async function count(where?: Prisma.ClientWhereInput) {
  return prisma.client.count({ where });
}

type FindManyParams = {
  skip?: number;
  take?: number;
  where?: Prisma.ClientWhereInput;
};

export const clientRepository = {
  findByUserId,
  updateAddressesStatusToFalse,
  createClientWithAddress,
  findMany,
  findById,
  count,
};
