import { Router } from 'express';
import { authAdminValidation, authValidation, validateQuery } from '@/middlewares';
import { createRevenueReport, createSalesReport } from '@/controllers';
import { createSalesReportSchema } from '@/schemas';

const reportsRouter = Router();

reportsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/sales', validateQuery(createSalesReportSchema), createSalesReport)
  .post('/revenue', validateQuery(createSalesReportSchema), createRevenueReport);

export { reportsRouter };
