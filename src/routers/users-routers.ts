import { Router } from 'express';
import { authValidation, validateBody } from '@/middlewares';
import { createUserSchema, loginSchema } from '@/schemas';
import { confirmEmail, create, login } from '@/controllers';

const usersRouter = Router();

usersRouter
  .get('/test', (req, res) => {
    res.send('Hello, world!');
  })
  .post('/login', validateBody(loginSchema), login)
  .all('/*', authValidation)
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail);

export { usersRouter };
