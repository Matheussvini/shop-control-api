import { PeriodType } from '@prisma/client';
import Joi from 'joi';

export const createSalesReportSchema = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate')),
  productId: Joi.number().min(1),
  period: Joi.string().valid(...Object.values(PeriodType)),
});

export const getAllReportsSchema = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')),
    otherwise: Joi.date(),
  }),
  period: Joi.string().valid(...Object.values(PeriodType)),
});
