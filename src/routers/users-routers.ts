import { Router } from 'express';
import { authValidation, validateBody } from '@/middlewares';
import { createUserSchema, loginSchema } from '@/schemas';
import { confirmEmail, create, createAdmin, login } from '@/controllers';

const usersRouter = Router();

usersRouter
  .get('/test', (req, res) => {
    res.send('Hello, world!');
  })
  .post('/login', validateBody(loginSchema), login)
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail)
  .all('/*', authValidation)
  .post('/admin', validateBody(createUserSchema), createAdmin);

export { usersRouter };
