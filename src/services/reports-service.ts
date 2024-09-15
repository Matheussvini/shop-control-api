import fs from 'fs';
import path from 'path';
import { $Enums } from '@prisma/client';
import { stringify } from 'csv';
import multer from 'multer';
import { ordersRepository, reportsRepository } from '@/repositories';
import { multerConfig } from '@/config'; // Importando o multer config

// Função auxiliar para salvar o arquivo CSV
async function uploadCSV(fileName: string, csvData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    multer(multerConfig).single('file');

    // Criar um buffer do conteúdo CSV para fazer o upload
    const buffer = Buffer.from(csvData);

    // Caminho temporário para salvar o arquivo localmente
    const tempPath = path.join(multerConfig.dest, fileName);

    // Escrevendo o arquivo no sistema de arquivos
    fs.writeFile(tempPath, buffer, (err) => {
      if (err) {
        reject('Error writing CSV file');
      } else {
        // Gerar a URL apropriada com base no armazenamento local ou S3
        const fileUrl = `${process.env.API_URL}/uploads/${fileName}`;
        resolve(fileUrl); // Retorna o caminho local ou a URL no S3
      }
    });
  });
}

async function generateSalesReport(period: $Enums.PeriodType, startDate?: Date, endDate?: Date, productId?: number) {
  // Obtendo dados de vendas
  const salesData = await reportsRepository.getSalesData(period, startDate, endDate, productId);

  // Calculando o total de vendas
  const totalSales = salesData.reduce((acc, item) => acc + Number(item.totalRevenue), 0);

  // Contando o número total de pedidos
  const totalOrders = await ordersRepository.count({
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    Items: productId ? { some: { productId } } : undefined,
  });

  // Gerar o nome do arquivo
  const fileName = `sales_report_${Date.now()}.csv`;

  // Criar o conteúdo CSV
  const csvData = salesData.map((item) => [item.productName, item.totalQuantity, Number(item.totalRevenue)]);
  const header = ['product name', 'total quantity', 'total revenue'];
  const csvString = await new Promise<string>((resolve, reject) => {
    stringify([header, ...csvData], (err, output) => {
      if (err) {
        reject('Error generating CSV');
      }
      resolve(output);
    });
  });

  // Usar a função de upload para salvar o CSV (localmente ou no S3)
  const fileUrl = await uploadCSV(fileName, csvString);

  // Salvando os dados do relatório no banco
  await reportsRepository.create({
    period,
    startDate,
    endDate,
    totalSales,
    totalOrders,
    path: fileUrl, // Salva a URL do arquivo no banco
  });

  return fileUrl;
}

export const reportsService = {
  generateSalesReport,
};
