import { $Enums, OrderStatus } from '@prisma/client';
import Joi from 'joi';
import { Pagination } from '@/types';

export const getAllOrdersSchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1),
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .optional(),
  minTotal: Joi.number().min(0).optional(),
  maxTotal: Joi.number().when('minTotal', {
    is: Joi.exist(),
    then: Joi.number().greater(Joi.ref('minTotal')),
    otherwise: Joi.number().min(0),
  }),
  minDate: Joi.date().optional(),
  maxDate: Joi.date().when('minDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('minDate')),
    otherwise: Joi.date(),
  }),
});

export const updateStatusSchema = Joi.object({
  orderId: Joi.number().min(0).required(),
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required(),
});

export type GetAllOrdersParams = Pagination & {
  status?: $Enums.OrderStatus;
  minTotal?: number;
  maxTotal?: number;
  minDate?: string;
  maxDate?: string;
};
