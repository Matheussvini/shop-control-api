import { Router } from 'express';
import { authValidation, validateBody, validateQuery } from '@/middlewares';
import { createUserSchema, getAllSchema, loginSchema, updateUserSchema } from '@/schemas';
import { confirmEmail, create, createAdmin, getAll, getById, login, update } from '@/controllers';

const usersRouter = Router();

usersRouter
  .get('/test', (req, res) => {
    res.send('Hello, world!');
  })
  .post('/login', validateBody(loginSchema), login)
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail)
  .all('/*', authValidation)
  .post('/admin', validateBody(createUserSchema), createAdmin)
  .get('/', validateQuery(getAllSchema), getAll)
  .get('/:id', getById)
  .patch('/:id', validateBody(updateUserSchema), update);

export { usersRouter };
