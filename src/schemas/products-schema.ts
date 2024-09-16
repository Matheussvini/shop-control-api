import { Product } from '@prisma/client';
import Joi from 'joi';
import { Pagination } from './../types/shared-types';
import { AutoProperty } from '@/types';

export const createProductSchema = Joi.object<CreateProductInput>({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(3).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
});

export const getAllProductsSchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1),
  name: Joi.string(),
  description: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().when('minPrice', {
    is: Joi.exist(),
    then: Joi.number().greater(Joi.ref('minPrice')),
    otherwise: Joi.number().min(0),
  }),
  minStock: Joi.number().min(0),
  maxStock: Joi.number().when('minStock', {
    is: Joi.exist(),
    then: Joi.number().greater(Joi.ref('minStock')),
    otherwise: Joi.number().min(0),
  }),
  status: Joi.boolean(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  description: Joi.string().min(3).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  status: Joi.boolean().optional(),
}).or('name', 'description', 'price', 'stock', 'status');

type OmitProduct = Omit<Product, keyof AutoProperty>;

export type CreateProductInput = Omit<OmitProduct, 'status'>;

export type GetAllProductsParams = Pagination & {
  name?: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  status?: boolean;
};
