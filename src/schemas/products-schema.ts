import { Product } from '@prisma/client';
import Joi from 'joi';
import { AutoProperty } from '@/types';

export const createProductSchema = Joi.object<CreateProductInput>({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(3).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
});

type OmitProduct = Omit<Product, keyof AutoProperty>;

export type CreateProductInput = Omit<OmitProduct, 'status'>;
