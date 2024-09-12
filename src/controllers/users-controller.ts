import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from '@/services';

export async function create(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { username, email, password, type } = req.body;

  try {
    await userService.create({
      username,
      email,
      password,
      type,
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
