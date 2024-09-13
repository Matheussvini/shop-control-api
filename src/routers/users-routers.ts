import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { changePasswordSchema, createUserSchema, getAllSchema, loginSchema, updateUserSchema } from '@/schemas';
import {
  changePassword,
  confirmEmail,
  create,
  createAdmin,
  deleteById,
  getAll,
  getById,
  login,
  update,
} from '@/controllers';

const usersRouter = Router();

usersRouter
  .get('/test', (req, res) => {
    res.send('Hello, world!');
  })
  .post('/login', validateBody(loginSchema), login)
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail)
  .all('/*', authValidation)
  .get('/:id', getById)
  .patch('/:id', validateBody(updateUserSchema), update)
  .delete('/:id', deleteById)
  .put('/password/:id', validateBody(changePasswordSchema), changePassword)
  .all('/*', authAdminValidation)
  .post('/admin', validateBody(createUserSchema), createAdmin)
  .get('/', validateQuery(getAllSchema), getAll);

export { usersRouter };
