import Joi from 'joi';
import { User } from '@prisma/client';
import { AutoProperty } from '@/types';

export const createUserSchema = Joi.object<CreateUserInput>({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object<LoginInput>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

type OmitUser = Omit<User, keyof AutoProperty>;
export type CreateUserInput = Omit<OmitUser, 'type'> & Partial<Pick<User, 'type'>>;

export type LoginInput = Pick<User, 'email' | 'password'>;
