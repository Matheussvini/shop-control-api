import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { clientService, GetAllClientsParams } from '@/services';

export async function createClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  try {
    const client = await clientService.create(req.body);

    return res.status(httpStatus.CREATED).send(client);
  } catch (error) {
    next(error);
  }
}

export async function getAllClients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { page = 1, limit = 10, fullName, contact, status } = req.query;

  try {
    const filters: GetAllClientsParams = {
      page: Number(page),
      limit: Number(limit),
      fullName: fullName as string,
      contact: contact as string,
    };

    if (status === 'true' || status === 'false') filters.status = Boolean(status);

    const clients = await clientService.getAll(filters);

    return res.status(httpStatus.OK).send(clients);
  } catch (error) {
    next(error);
  }
}

export async function getClientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { user } = req;
  try {
    const client = await clientService.getById(Number(id), user);

    return res.status(httpStatus.OK).send(client);
  } catch (error) {
    next(error);
  }
}
