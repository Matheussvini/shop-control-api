import { $Enums, OrderStatus } from '@prisma/client';
import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { validateClient } from './clients-controller';
import { AuthenticatedRequest } from '@/middlewares';
import { ordersService } from '@/services';
import { GetAllOrdersParams } from '@/schemas';

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { user } = req;

  try {
    const order = await ordersService.create(user);
    return res.status(httpStatus.CREATED).send({ message: 'Order created successfully!', data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersByClientId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  const { clientId } = req.params;
  const { user } = req;

  try {
    await validateClient(Number(clientId), user);
    const orders = await ordersService.getByClientId(Number(clientId));
    return res.status(httpStatus.OK).send(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;
  const { user } = req;

  try {
    const order = await ordersService.getById(Number(id), user);
    return res.status(httpStatus.OK).send(order);
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { page = 1, limit = 10, staus, minTotal, maxTotal, minDate, maxDate } = req.query;

  try {
    const filters: GetAllOrdersParams = {
      page: Number(page),
      limit: Number(limit),
      status: staus as $Enums.OrderStatus,
      minTotal: Number(minTotal),
      maxTotal: Number(maxTotal),
      minDate: minDate as string,
      maxDate: maxDate as string,
    };

    const orders = await ordersService.getAll(filters);

    return res.status(httpStatus.OK).send(orders);
  } catch (error) {
    next(error);
  }
}

export async function doPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { orderId } = req.params;

  try {
    const payment = await ordersService.simulatePayment(Number(orderId));
    if (payment.success) {
      const result = await ordersService.paymentDone(Number(orderId));
      return res.status(httpStatus.OK).send({ message: 'Payment successful!', data: result });
    }
    return res.status(httpStatus.PAYMENT_REQUIRED).send({ message: 'Payment failed!' });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  const { orderId, status } = req.params;

  try {
    const result = await ordersService.updateStatus(Number(orderId), status as OrderStatus);
    return res.status(httpStatus.OK).send({ message: 'Order status updated successfully!', data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response> {
  const { id } = req.params;

  try {
    await ordersService.exclude(Number(id));
    return res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
