import { Router } from 'express';
import { authAdminValidation, authValidation, validateBody, validateQuery } from '@/middlewares';
import { changePasswordSchema, createUserSchema, getAllUserSchema, loginSchema, updateUserSchema } from '@/schemas';
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
  .post('/', validateBody(createUserSchema), create)
  .get('/confirm-email/:token', confirmEmail)
  .post('/login', validateBody(loginSchema), login)
  .all('/*', authValidation)
  .get('/:id', getById)
  .patch('/:id', validateBody(updateUserSchema), update)
  .put('/password/:id', validateBody(changePasswordSchema), changePassword)
  .delete('/:id', deleteById)
  .all('/*', authAdminValidation)
  .post('/admin', validateBody(createUserSchema), createAdmin)
  .get('/', validateQuery(getAllUserSchema), getAll);

export { usersRouter };
