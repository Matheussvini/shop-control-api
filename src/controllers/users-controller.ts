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

  try {
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

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { page = 1, limit = 10, username, email, type } = req.query;

  try {
    const users = await userService.getAll({
      page: Number(page),
      limit: Number(limit),
      username: username as string,
      email: email as string,
      type: type as string,
    });
    return res.status(httpStatus.OK).send(users);
  } catch (error) {
    next(error);
  }
}

export async function validateUser(id: number, userId: number, type: string): Promise<void> {
  if (type !== 'admin' && id !== userId) {
    throw unauthorizedError("You don't have permission to access other user");
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { id: userId, type } = req.user;

  try {
    await validateUser(Number(id), userId, type);

    const user = await userService.getById(Number(id));
    return res.status(httpStatus.OK).send(user);
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { username, email } = req.body;
  const { id: userId, type } = req.user;

  try {
    await validateUser(Number(id), userId, type);

    const updatedUser = await userService.update(Number(id), {
      username,
      email,
    });
    return res.status(httpStatus.OK).send(updatedUser);
  } catch (error) {
    next(error);
  }
}

export async function deleteById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { id: userId, type } = req.user;

  try {
    await validateUser(Number(id), userId, type);

    await userService.deleteById(Number(id));
    return res.status(httpStatus.NO_CONTENT).send(`User with id ${id} deleted successfully`);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { id: userId } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    await userService.changePassword(Number(id), userId, oldPassword, newPassword);

    return res.status(httpStatus.OK).send({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}
