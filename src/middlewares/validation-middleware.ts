import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { invalidDataError } from '@/errors';

export function validateBody<T>(schema: ObjectSchema<T>): ValidationMiddleware {
  return validate(schema, 'body');
}

export function validateParams<T>(schema: ObjectSchema<T>): ValidationMiddleware {
  return validate(schema, 'params');
}

export function validateQuery<T>(schema: ObjectSchema<T>): ValidationMiddleware {
  return validate(schema, 'query');
}

function validate(schema: ObjectSchema, type: 'body' | 'params' | 'query'): ValidationMiddleware {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[type], {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      const invalidParams = error.details.map((d) => d.message);
      const validParams = schema.describe().keys ? Object.keys(schema.describe().keys) : [];

      throw invalidDataError({ details: invalidParams, validParams });
    }
    next();
  };
}

type ValidationMiddleware = (req: Request, res: Response, next: NextFunction) => void;
