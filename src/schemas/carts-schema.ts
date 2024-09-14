import { CartItem } from '@prisma/client';
import Joi from 'joi';
import { AutoProperty } from '@/types';

export const addProductToCartSchema = Joi.object<ChangeProductToCartInput>({
  clientId: Joi.number().min(0).required(),
  productId: Joi.number().min(0).required(),
  quantity: Joi.number().integer().not(0).required(),
});

export type ChangeProductToCartInput = Omit<CartItem, keyof AutoProperty>;
