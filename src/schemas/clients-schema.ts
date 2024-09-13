import { Address, Client } from '@prisma/client';
import Joi from 'joi';
import { AutoProperty } from '@/types';

export const createClientSchema = Joi.object<CreateClientInput>({
  userId: Joi.number().min(1).required(),
  fullName: Joi.string().min(3).max(255).required(),
  contact: Joi.string().min(10).max(11).required(),
  address: Joi.object({
    cep: Joi.string().length(8).required(),
    logradouro: Joi.string().min(3).max(255).required(),
    numero: Joi.string().min(1).max(10).required(),
    complemento: Joi.string().min(1).max(255),
    bairro: Joi.string().min(3).max(255).required(),
    cidade: Joi.string().min(3).max(255).required(),
    estado: Joi.string().length(2).required(),
  }).required(),
});

type OmitClient = Omit<Client, keyof AutoProperty | 'status'>;
export type CreateClientInput = OmitClient & {
  address: Omit<Address, keyof AutoProperty>;
};
