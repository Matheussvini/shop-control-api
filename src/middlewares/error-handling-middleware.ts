import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApplicationError } from '@/protocols';

export function handleApplicationErrors(err: ApplicationError, req: Request, res: Response, next: NextFunction) {
  if (err.name === 'ConflictError') {
    return res.status(httpStatus.CONFLICT).send({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: err.message });
  }

  if (err.name === 'NotFoundError') {
    return res.status(httpStatus.NOT_FOUND).send({ message: err.message });
  }

  if (err.name === 'InvalidCredentialsError') {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: err.message });
  }

  if (err.name === 'UnprocessableEntityError') {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).send({ message: err.message });
  }

  if (err.name === 'InvalidDataError') {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: err.message,
      details: err.details,
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(httpStatus.FORBIDDEN).send({ message: err.message });
  }

  if (err.name === 'BadRequestError') {
    return res.status(httpStatus.BAD_REQUEST).send({ message: err.message });
  }

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    error: err,
    message: err.message,
  });
}
