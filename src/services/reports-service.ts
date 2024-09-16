import fs from 'fs';
import path from 'path';
import { $Enums } from '@prisma/client';
import { stringify } from 'csv';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { ordersRepository, reportsRepository } from '@/repositories';
import { multerConfig } from '@/config';
import { notFoundError } from '@/errors';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
});

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function uploadCSV(fileName: string, csvData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageType = process.env.STORAGE_TYPE;

    const buffer = Buffer.from(csvData);

    if (storageType === 's3') {
      const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ACL: ObjectCannedACL.public_read_write,
        ContentType: 'text/csv',
      };

      const command = new PutObjectCommand(s3Params);

      s3.send(command)
        .then(() => {
          const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${fileName}`;
          resolve(s3Url);
        })
        .catch((err) => {
          reject({ message: 'Error uploading file to S3', error: err });
        });
    } else {
      const tempPath = path.join(multerConfig.dest, fileName);

      ensureDirectoryExistence(tempPath);

      fs.writeFile(tempPath, buffer, (err) => {
        if (err) reject({ message: 'Error writing CSV file', error: err });
        else {
          const fileUrl = `${process.env.API_URL}/uploads/${fileName}`;
          resolve(fileUrl);
        }
      });
    }
  });
}
async function generateSalesReport(period: $Enums.PeriodType, startDate?: Date, endDate?: Date, productId?: number) {
  const salesData = await reportsRepository.getSalesData(period, startDate, endDate, productId);
  if (!salesData.length) throw notFoundError('No sales data found for the selected filters');

  const totalSales = salesData.reduce((acc, item) => acc + Number(item.totalRevenue), 0);
  const totalOrders = await ordersRepository.count({
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    Items: productId ? { some: { productId } } : undefined,
    status: { not: 'RECEBIDO' },
  });

  const fileName = `sales_report_${Date.now()}.csv`;

  const csvData = salesData.map((item) => [item.productName, item.totalQuantity, Number(item.totalRevenue)]);
  const header = ['product name', 'total quantity', 'total revenue'];
  const csvString = await new Promise<string>((resolve, reject) => {
    stringify([header, ...csvData], (err, output) => {
      if (err) {
        console.log(err);
        reject('Error generating CSV');
      }
      resolve(output);
    });
  });

  const fileUrl = await uploadCSV(fileName, csvString);

  const filters = {
    startDate,
    endDate,
    productId,
  };

  await reportsRepository.create({
    period,
    totalSales,
    totalOrders,
    path: fileUrl,
    filters,
  });

  return { message: 'Sales report generated successfully', fileUrl };
}

async function generateRevenueReport(period: $Enums.PeriodType, startDate?: Date, endDate?: Date, productId?: number) {
  const revenueData = await reportsRepository.getRevenueData(period, startDate, endDate, productId);
  if (!revenueData.length) throw notFoundError('No revenue data found for the selected filters');

  const totalSales = revenueData.reduce((acc, item) => acc + Number(item.totalRevenue), 0);

  const fileName = `revenue_report_${Date.now()}.csv`;

  const csvData = revenueData.map((item) => [item.productName, Number(item.totalRevenue), item.totalOrders]);
  const header = ['Product Name', 'Total Revenue', 'Total Orders'];
  const csvString = await new Promise<string>((resolve, reject) => {
    stringify([header, ...csvData], (err, output) => {
      if (err) {
        console.log(err);
        reject('Error generating CSV');
      }
      resolve(output);
    });
  });

  const fileUrl = await uploadCSV(fileName, csvString);

  const filters = {
    startDate,
    endDate,
    productId,
  };

  await reportsRepository.create({
    period,
    totalSales,
    totalOrders: revenueData.length,
    path: fileUrl,
    filters,
  });

  return { message: 'Revenue report generated successfully', fileUrl };
}

export const reportsService = {
  generateSalesReport,
  generateRevenueReport,
};
