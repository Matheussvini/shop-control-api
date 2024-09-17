import { reportsService } from '@/services/reports-service';
import { reportsRepository } from '@/repositories';
import { notFoundError } from '@/errors';

jest.mock('@aws-sdk/client-s3');
jest.mock('fs');
jest.mock('path');
jest.mock('@/repositories/reports-repository');
jest.mock('@/repositories/orders-repository');
jest.mock('multer-s3', () => {
  return jest.fn(() => ({
    storage: jest.fn(),
  }));
});

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}), // Mock da função send
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        product: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      };
    }),
  };
});
describe('Reports Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSalesReport', () => {
    it('should throw not found error if no sales data found', async () => {
      (reportsRepository.getSalesData as jest.Mock).mockResolvedValue([]);

      try {
        await reportsService.generateSalesReport('month', new Date(), new Date());
      } catch (error) {
        expect(error).toEqual(notFoundError('No sales data found for the selected filters'));
      }
    });
  });

  describe('generateRevenueReport', () => {
    it('should throw not found error if no revenue data found', async () => {
      (reportsRepository.getRevenueData as jest.Mock).mockResolvedValue([]);

      try {
        await reportsService.generateRevenueReport('month', new Date(), new Date());
      } catch (error) {
        expect(error).toEqual(notFoundError('No revenue data found for the selected filters'));
      }
    });
  });

  describe('getAll', () => {
    it('should return all reports', async () => {
      const mockReports = [{ id: 1, period: 'month', totalSales: 150, totalOrders: 15, path: 'path/to/report.csv' }];
      (reportsRepository.getAll as jest.Mock).mockResolvedValue(mockReports);

      const result = await reportsService.getAll('month', new Date(), new Date());

      expect(result).toEqual(mockReports);
      expect(reportsRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('deleteReportById', () => {
    it('should delete a report successfully', async () => {
      const mockReport = { id: 1, key: 'report-key', path: 'path/to/report.csv' };

      (reportsRepository.findById as jest.Mock).mockResolvedValue(mockReport);
      (reportsRepository.deleteById as jest.Mock).mockResolvedValue({});

      const result = await reportsService.deleteReportById(1);

      expect(result).toEqual({ message: 'Report deleted successfully' });
      expect(reportsRepository.findById).toHaveBeenCalled();
      expect(reportsRepository.deleteById).toHaveBeenCalled();
    });

    it('should throw not found error if report does not exist', async () => {
      (reportsRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await reportsService.deleteReportById(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Report not found'));
      }
    });
  });
});
