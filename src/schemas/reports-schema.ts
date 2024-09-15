import { PeriodType } from '@prisma/client';
import Joi from 'joi';

export const createSalesReportSchema = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate')),
  productId: Joi.number().min(1),
  period: Joi.string().valid(...Object.values(PeriodType)),
});
