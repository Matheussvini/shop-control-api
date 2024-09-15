import { Router } from 'express';
import { authAdminValidation, authValidation, validateParams } from '@/middlewares';
import { createSalesReport } from '@/controllers';
import { createSalesReportSchema } from '@/schemas';

const reportsRouter = Router();

reportsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/sales', validateParams(createSalesReportSchema), createSalesReport);

export { reportsRouter };
