import { CartItem } from '@prisma/client';
import Joi from 'joi';
import { AutoProperty } from '@/types';

export const addProductToCartSchema = Joi.object<ChangeProductToCartInput>({
  clientId: Joi.number().min(0).required(),
  productId: Joi.number().min(0).required(),
  quantity: Joi.number().integer().not(0).required(),
});

export const getAllCartsSchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1),
  minDate: Joi.date(),
  maxDate: Joi.date().greater(Joi.ref('minDate')),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0).greater(Joi.ref('minPrice')),
  productName: Joi.string().optional(),
});

export type ChangeProductToCartInput = Omit<CartItem, keyof AutoProperty>;
