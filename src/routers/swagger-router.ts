import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '@/swagger';

export const swaggerRouter = Router();

swaggerRouter.use('/', swaggerUi.serve).get('/', swaggerUi.setup(swaggerDocument));
