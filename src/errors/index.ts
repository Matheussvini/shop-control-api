import { ApplicationError } from '@/protocols.js';

export function conflictError(message: string, details?): ApplicationError {
  return {
    name: 'ConflictError',
    message,
    details,
  };
}

export function unprocessableEntityError(message: string, details?): ApplicationError {
  return {
    name: 'UnprocessableEntityError',
    message,
    details,
  };
}

export function invalidCredentialsError(message: string, details?): ApplicationError {
  return {
    name: 'InvalidCredentialsError',
    message,
    details,
  };
}

export function notFoundError(message: string, details?): ApplicationError {
  return {
    name: 'NotFoundError',
    message,
    details,
  };
}

export function unauthorizedError(message: string, details?): ApplicationError {
  return {
    name: 'UnauthorizedError',
    message,
    details,
  };
}

export function invalidDataError(params: SchemaError): ApplicationError & SchemaError {
  return {
    name: 'InvalidDataError',
    message: 'Invalid data',
    ...params,
  };
}

type SchemaError = {
  details: string[];
  validParams: string[];
};

export function forbiddenError(message: string, details?): ApplicationError {
  return {
    name: 'ForbiddenError',
    message,
    details,
  };
}

export function badRequestError(message: string, details?): ApplicationError {
  return {
    name: 'BadRequestError',
    message,
    details,
  };
}
