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
  maxDate: Joi.date().when('minDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('minDate')),
    otherwise: Joi.date(),
  }),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().when('minPrice', {
    is: Joi.exist(),
    then: Joi.number().greater(Joi.ref('minPrice')),
    otherwise: Joi.number().min(0),
  }),
  productName: Joi.string().optional(),
});

export type ChangeProductToCartInput = Omit<CartItem, keyof AutoProperty>;
