import { Prisma, $Enums } from '@prisma/client';
import { prisma } from '@/config';

interface SalesData {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

async function getSalesData(
  period: $Enums.PeriodType,
  startDate?: Date,
  endDate?: Date,
  productId?: number,
): Promise<SalesData[]> {
  const dateGroup: string = `DATE_TRUNC('${period}', o."createdAt")`;

  const whereClause: Prisma.Sql[] = [];

  // Considerando apenas pedidos com status diferente de 'RECEBIDO'
  whereClause.push(Prisma.sql`o."status" != 'Recebido'`);

  if (startDate && endDate) {
    whereClause.push(Prisma.sql`o."createdAt" BETWEEN ${startDate} AND ${endDate}`);
  }

  if (productId) {
    whereClause.push(Prisma.sql`i."productId" = ${productId}`);
  }

  const whereQuery = whereClause.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereClause, ' AND ')}` : Prisma.empty;

  const query = Prisma.sql`
    SELECT p."name" AS "productName", SUM(i."quantity") AS "totalQuantity", SUM(i."subtotal") AS "totalRevenue"
    FROM items i
    JOIN orders o ON o."id" = i."orderId"
    JOIN products p ON p."id" = i."productId"
    ${whereQuery}
    GROUP BY ${Prisma.raw(dateGroup)}, p."name"
    ORDER BY "totalRevenue" DESC;
  `;

  return prisma.$queryRaw(query) as Promise<SalesData[]>;
}

async function create(reportData: Prisma.ReportCreateInput) {
  return prisma.report.create({
    data: reportData,
  });
}

export const reportsRepository = {
  getSalesData,
  create,
};
