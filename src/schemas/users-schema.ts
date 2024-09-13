import Joi from 'joi';
import { User } from '@prisma/client';
import { AutoProperty } from '@/types';
import { GetAllUsersParams } from '@/services';

export const createUserSchema = Joi.object<CreateUserInput>({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object<LoginInput>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const getAllSchema = Joi.object<GetAllUsersParams>({
  page: Joi.number().min(1),
  limit: Joi.number().min(1),
  username: Joi.string().min(3),
  email: Joi.string().email(),
  type: Joi.string().valid('cliente', 'admin'),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).optional(),
  email: Joi.string().email().optional(),
}).or('username', 'email');

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

type OmitUser = Omit<User, keyof AutoProperty>;

export type CreateUserInput = Omit<OmitUser, 'type'> & Partial<Pick<User, 'type'>>;

export type LoginInput = Pick<User, 'email' | 'password'>;

export type UpdateUserInput = Partial<Pick<User, 'username' | 'email'>>;
