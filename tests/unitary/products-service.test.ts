import fs from 'fs';
import path from 'path';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { productService } from '@/services/products-service';
import { productRepository } from '@/repositories';
import { notFoundError } from '@/errors';

jest.mock('@/repositories');
jest.mock('fs');
jest.mock('path');
jest.mock('multer-s3', () => {
  return jest.fn(() => ({
    storage: jest.fn(),
  }));
});

jest.mock('@aws-sdk/client-s3', () => {
  const S3Client = jest.fn();
  const DeleteObjectCommand = jest.fn();
  return { S3Client, DeleteObjectCommand };
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

describe('productService', () => {
  const mockProduct = { name: 'Product 1', description: 'A good product', price: 100, stock: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      (productRepository.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create(mockProduct);

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('getAll', () => {
    it('should return products with pagination and filters', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1', price: 100, stock: 10, status: true }];
      const mockTotal = 1;

      const filters = {
        page: 1,
        limit: 10,
        name: 'Product',
        minPrice: 50,
        maxPrice: 150,
        minStock: 5,
        maxStock: 20,
        status: true,
      };

      (productRepository.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (productRepository.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await productService.getAll(filters);

      expect(result).toEqual({ data: mockProducts, total: mockTotal, page: 1, limit: 10 });
      expect(productRepository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: { contains: 'Product', mode: 'insensitive' },
          price: { gte: 50, lte: 150 },
          stock: { gte: 5, lte: 20 },
          status: true,
        },
      });

      expect(productRepository.count).toHaveBeenCalledWith({
        name: { contains: 'Product', mode: 'insensitive' },
        price: { gte: 50, lte: 150 },
        stock: { gte: 5, lte: 20 },
        status: true,
      });
    });
  });

  describe('getById', () => {
    it('should return a product by ID', async () => {
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getById(1);

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if product does not exist', async () => {
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await productService.getById(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Product not found'));
      }
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateData = { name: 'Updated Product' };
      (productRepository.update as jest.Mock).mockResolvedValue({ ...mockProduct, ...updateData });

      const result = await productService.update(1, updateData);

      expect(result).toEqual({ ...mockProduct, ...updateData });
      expect(productRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteById', () => {
    it('should delete a product by ID', async () => {
      (productRepository.deleteById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.deleteById(1);

      expect(result).toEqual(mockProduct);
      expect(productRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('persistImage', () => {
    it('should persist an image for a product', async () => {
      const mockImage = { path: 'image/path', key: 'image-key' };
      (productRepository.saveImage as jest.Mock).mockResolvedValue(mockImage);
      (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.persistImage(1, 'image/path', 'image-key');

      expect(result).toEqual(mockImage);
      expect(productRepository.saveImage).toHaveBeenCalledWith({
        productId: 1,
        path: 'image/path',
        key: 'image-key',
      });
    });

    it('should throw not found error if product does not exist', async () => {
      (productRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await productService.persistImage(1, 'image/path', 'image-key');
      } catch (error) {
        expect(error).toEqual(notFoundError('Product not found'));
      }
    });
  });

  describe('deleteImage', () => {
    it('should delete an image from S3 if the image has a key', async () => {
      const mockImage = { id: 1, path: 'image.jpg', key: 's3-key' };

      // Mockando a resposta para encontrar a imagem
      (productRepository.findImageById as jest.Mock).mockResolvedValue(mockImage);

      // Mockando a chamada ao S3 para deletar a imagem
      const mockS3Send = jest.fn().mockResolvedValue({});
      S3Client.prototype.send = mockS3Send;

      const result = await productService.deleteImage(1);

      expect(result).toEqual(undefined);
      expect(S3Client.prototype.send).toHaveBeenCalled();
      expect(productRepository.deleteImage).toHaveBeenCalledWith(1);
    });

    it('should delete an image from local storage if the image has no key', async () => {
      const mockImage = { id: 1, path: 'image/path', key: null };
      (productRepository.findImageById as jest.Mock).mockResolvedValue(mockImage);
      (productRepository.deleteImage as jest.Mock).mockResolvedValue(mockImage);
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(jest.fn());

      const result = await productService.deleteImage(1);

      expect(result).toEqual(mockImage);
      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'tmp', 'uploads', 'image/path'));
      expect(fs.unlinkSync).toHaveBeenCalledWith(path.resolve(process.cwd(), 'tmp', 'uploads', 'image/path'));
      expect(productRepository.deleteImage).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if image does not exist', async () => {
      (productRepository.findImageById as jest.Mock).mockResolvedValue(null);

      try {
        await productService.deleteImage(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Image not found'));
      }
    });
  });
});
