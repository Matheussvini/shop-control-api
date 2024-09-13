import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from '@/services';
import { LoginInput } from '@/schemas';
import { unauthorizedError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';

export async function create(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { username, email, password } = req.body;

  try {
    await userService.create({
      username,
      email,
      password,
    });
    return res.status(httpStatus.CREATED).send({
      message: 'Confirmation email sent, your user will be created after confirmation',
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { username, email, password } = req.body;
  const { user } = req;

  try {
    if (user.type !== 'admin') {
      throw unauthorizedError('You do not have permission to create an admin user');
    }
    console.log('else', user);
    await userService.create({
      username,
      email,
      password,
      type: 'admin',
    });
    return res.status(httpStatus.CREATED).send({
      message: 'Confirmation email sent, your user will be created after confirmation',
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmEmail(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { token } = req.params;

  try {
    await userService.confirmEmail(token);
    return res.status(httpStatus.OK).send({
      message: 'Email confirmed, user created successfully!',
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { email, password } = req.body as LoginInput;

  try {
    const user = await userService.login({ email, password });
    return res.status(httpStatus.OK).send(user);
  } catch (error) {
    next(error);
  }
}
