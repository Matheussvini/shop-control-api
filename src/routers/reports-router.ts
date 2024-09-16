import { Router } from 'express';
import { authAdminValidation, authValidation, validateQuery } from '@/middlewares';
import { createRevenueReport, createSalesReport, getAllReports } from '@/controllers';
import { createSalesReportSchema, getAllReportsSchema } from '@/schemas';

const reportsRouter = Router();

reportsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/sales', validateQuery(createSalesReportSchema), createSalesReport)
  .post('/revenue', validateQuery(createSalesReportSchema), createRevenueReport)
  .get('/', validateQuery(getAllReportsSchema), getAllReports);

export { reportsRouter };
