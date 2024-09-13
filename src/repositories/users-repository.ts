import { Prisma } from '@prisma/client';
import { prisma } from '@/config';
import { CreateUserInput } from '@/schemas';

async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

async function findById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

async function create(data: CreateUserInput) {
  return await prisma.user.create({
    data,
  });
}

async function findMany(params: FindManyParams) {
  return await prisma.user.findMany({
    ...params,
    select: {
      id: true,
      username: true,
      email: true,
      type: true,
    },
  });
}

export async function count(where?: Prisma.UserWhereInput) {
  return prisma.user.count({ where });
}

type FindManyParams = {
  skip?: number;
  take?: number;
  where?: Prisma.UserWhereInput;
};

export const userRepository = {
  findByEmail,
  findById,
  create,
  findMany,
  count,
};
