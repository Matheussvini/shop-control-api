import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { unauthorizedError } from '@/errors';
import { userRepository } from '@/repositories';

export async function authValidation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw unauthorizedError('Authentication token missing');

    const token = authorization?.replace('Bearer ', '');
    if (!token) throw unauthorizedError('Authentication token missing');

    const { userId } = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if (!userId) throw unauthorizedError('Authentication token invalid');

    const user = await userRepository.findById(Number(userId));
    if (!user) throw unauthorizedError('Authentication token invalid');

    delete user.password;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export type AuthenticatedRequest = Request & {
  user: Omit<User, 'password'>;
};

type JwtPayload = {
  userId: number;
};
