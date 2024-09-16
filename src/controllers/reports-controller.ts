import { $Enums } from '@prisma/client';
import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { reportsService } from '@/services';

export async function createSalesReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { period = 'month', startDate, endDate, productId } = req.query;

  try {
    const report = await reportsService.generateSalesReport(
      period as $Enums.PeriodType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      productId ? Number(productId) : undefined,
    );

    return res.status(httpStatus.CREATED).send(report);
  } catch (error) {
    next(error);
  }
}

export async function createRevenueReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { period = 'month', startDate, endDate, productId } = req.query;

  try {
    const report = await reportsService.generateRevenueReport(
      period as $Enums.PeriodType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      productId ? Number(productId) : undefined,
    );

    return res.status(httpStatus.CREATED).send(report);
  } catch (error) {
    next(error);
  }
}

export async function getAllReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { period, startDate, endDate } = req.query;

  try {
    const reports = await reportsService.getAll(
      period as $Enums.PeriodType,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    return res.status(httpStatus.OK).send(reports);
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { id } = req.params;

  try {
    const result = await reportsService.deleteReportById(Number(id));
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    next(error);
  }
}
