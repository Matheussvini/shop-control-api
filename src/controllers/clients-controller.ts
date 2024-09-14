import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest, SecuryUser } from '@/middlewares';
import { clientService, GetAllClientsParams } from '@/services';
import { clientRepository } from '@/repositories';
import { unauthorizedError } from '@/errors';

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

    if (status === 'true') filters.status = true;
    else if (status === 'false') filters.status = false;

    const clients = await clientService.getAll(filters);

    return res.status(httpStatus.OK).send(clients);
  } catch (error) {
    next(error);
  }
}

async function validateUser(clientId: number, user: SecuryUser) {
  const client = await clientRepository.findByUserId(user.id);
  if (user.type !== 'admin' && client?.id !== clientId)
    throw unauthorizedError("You don't have permission to access other user");
}

export async function getClientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { user } = req;
  try {
    await validateUser(Number(id), user);
    const client = await clientService.getById(Number(id));

    return res.status(httpStatus.OK).send(client);
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { fullName, contact } = req.body;
  const { user } = req;

  try {
    await validateUser(Number(id), user);
    const updatedClient = await clientService.update(Number(id), { fullName, contact });

    return res.status(httpStatus.OK).send(updatedClient);
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { user } = req;

  try {
    await validateUser(Number(id), user);
    await clientService.deleteById(Number(id));

    return res.status(httpStatus.NO_CONTENT).send(`User with id ${id} deleted successfully`);
  } catch (error) {
    next(error);
  }
}
