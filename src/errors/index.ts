import { ApplicationError } from '@/protocols.js';

export function conflictError(message: string): ApplicationError {
  return {
    name: 'ConflictError',
    message,
  };
}

export function unprocessableEntityError(message: string): ApplicationError {
  return {
    name: 'UnprocessableEntityError',
    message,
  };
}

export function invalidCredentialsError(message: string): ApplicationError {
  return {
    name: 'InvalidCredentialsError',
    message,
  };
}

export function notFoundError(message: string): ApplicationError {
  return {
    name: 'NotFoundError',
    message,
  };
}

export function unauthorizedError(message: string): ApplicationError {
  return {
    name: 'UnauthorizedError',
    message,
  };
}

export function invalidDataError(details: string[]): ApplicationError & {
  details: string[];
} {
  return {
    name: 'InvalidDataError',
    message: 'Invalid data',
    details,
  };
}

export function forbiddenError(message: string): ApplicationError {
  return {
    name: 'ForbiddenError',
    message,
  };
}

export function badRequestError(message: string): ApplicationError {
  return {
    name: 'BadRequestError',
    message,
  };
}
