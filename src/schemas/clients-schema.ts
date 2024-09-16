import { Address, Client, Prisma } from '@prisma/client';
import Joi from 'joi';
import { AutoProperty, Pagination } from '@/types';

export const createClientSchema = Joi.object<CreateClientInput>({
  userId: Joi.number().min(1).required(),
  fullName: Joi.string().min(3).max(255).required(),
  contact: Joi.string().min(10).max(11).required(),
  address: Joi.object({
    cep: Joi.string().length(8).required(),
    logradouro: Joi.string().min(3).max(255).required(),
    numero: Joi.string().min(1).max(10).required(),
    complemento: Joi.string().max(255).optional(),
    bairro: Joi.string().min(3).max(255).required(),
    cidade: Joi.string().min(3).max(255).required(),
    estado: Joi.string().length(2).required(),
  }).required(),
});

export const getAllClientsSchema = Joi.object<Prisma.ClientWhereInput & Pagination>({
  page: Joi.number().min(1),
  limit: Joi.number().min(1),
  fullName: Joi.string().min(3),
  contact: Joi.string().min(10),
  status: Joi.boolean(),
});

export const updateClientSchema = Joi.object({
  fullName: Joi.string().min(3).optional(),
  contact: Joi.string().min(10).optional(),
}).or('fullName', 'contact');

type OmitClient = Omit<Client, keyof AutoProperty | 'status'>;

export type CreateClientInput = OmitClient & {
  address: Omit<Address, keyof AutoProperty>;
};
