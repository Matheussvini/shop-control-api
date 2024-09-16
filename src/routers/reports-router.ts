import { Router } from 'express';
import { authAdminValidation, authValidation, validateQuery } from '@/middlewares';
import { createSalesReport } from '@/controllers';
import { createSalesReportSchema } from '@/schemas';

const reportsRouter = Router();

reportsRouter
  .all('/*', authValidation)
  .all('/*', authAdminValidation)
  .post('/sales', validateQuery(createSalesReportSchema), createSalesReport);

export { reportsRouter };
