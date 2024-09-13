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
    if (error instanceof jwt.TokenExpiredError) {
      next(unauthorizedError('Authentication token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(unauthorizedError('Authentication token invalid'));
    }
    next(error);
  }
}

export async function authAdminValidation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user && req.user.type !== 'admin') throw unauthorizedError('Unauthorized access');
    next();
  } catch (error) {
    next(error);
  }
}

export type AuthenticatedRequest = Request & {
  user: SecuryUser;
};
export type SecuryUser = Omit<User, 'password'>;

type JwtPayload = {
  userId: number;
};
