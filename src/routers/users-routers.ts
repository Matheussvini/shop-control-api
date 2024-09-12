import { Router } from 'express';
import { authValidation, validateBody } from '@/middlewares';
import { createUserSchema } from '@/schemas';
import { confirmEmail, create } from '@/controllers';

const usersRouter = Router();

usersRouter
  .get('/test', (req, res) => {
    res.send('Hello, world!');
  })
  .all('/*', authValidation)
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail);

export { usersRouter };
