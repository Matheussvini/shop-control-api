import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { clientService } from '@/services';

export async function createClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  try {
    const client = await clientService.create(req.body);

    return res.status(httpStatus.CREATED).send(client);
  } catch (error) {
    next(error);
  }
}
