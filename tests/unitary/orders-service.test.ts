import { ordersService, cartsService } from '@/services';
import { clientRepository, ordersRepository, productRepository } from '@/repositories';
import { badRequestError, conflictError, notFoundError, unauthorizedError } from '@/errors';
import { SecuryUser } from '@/middlewares';
import { GetAllOrdersParams } from '@/schemas';

jest.mock('@/repositories', () => {
  return {
    clientRepository: {
      findByUserId: jest.fn(),
    },
    ordersRepository: {
      create: jest.fn(),
      findByClientId: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      completePayment: jest.fn(),
      updateStatus: jest.fn(),
      deleteById: jest.fn(),
    },
    productRepository: {
      findStockById: jest.fn(),
    },
  };
});

jest.mock('@/services/carts-service', () => ({
  cartsService: {
    getCart: jest.fn(),
  },
}));

describe('Orders Service', () => {
  const mockUser: SecuryUser = {
    id: 1,
    type: 'cliente',
    email: 'user@email.com',
    username: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should create an order successfully', async () => {
      const mockClient = { id: 1 };
      const mockCart = [{ Product: { status: true, stock: 10, name: 'Product 1' }, quantity: 2 }];
      const mockOrder = { id: 1, clientId: 1, total: 100, cart: mockCart };

      (clientRepository.findByUserId as jest.Mock).mockResolvedValue(mockClient);
      (cartsService.getCart as jest.Mock).mockResolvedValue({ total: 100, clientId: 1, cart: mockCart });
      (ordersRepository.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.create(mockUser);

      expect(result).toEqual(mockOrder);
      expect(clientRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(cartsService.getCart).toHaveBeenCalledWith(mockClient.id);
      expect(ordersRepository.create).toHaveBeenCalledWith({ clientId: 1, total: 100, cart: mockCart });
    });

    it('should throw not found error if client does not exist', async () => {
      (clientRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.create(mockUser);
      } catch (error) {
        expect(error).toEqual(notFoundError('Client not found'));
      }
    });

    it('should throw not found error if cart is empty ', async () => {
      const mockClient = { id: 1 };

      (clientRepository.findByUserId as jest.Mock).mockResolvedValue(mockClient);
      (cartsService.getCart as jest.Mock).mockResolvedValue({ total: 0, clientId: 1, cart: [] });

      try {
        await ordersService.create(mockUser);
      } catch (error) {
        expect(error).toEqual(notFoundError('Shopping cart is empty'));
      }
    });
  });

  describe('validateCartStock', () => {
    it('should throw conflict error if a product is unavailable', async () => {
      const mockCart = [
        {
          Product: {
            name: 'Product 1',
            status: false, // Produto indisponível
            stock: 10,
          },
          quantity: 2,
        },
      ];

      try {
        await ordersService.validateCartStock(mockCart);
      } catch (error) {
        expect(error).toEqual(conflictError('Product "Product 1" is unavailable'));
      }
    });

    it('should throw conflict error if a product has insufficient stock', async () => {
      const mockCart = [
        {
          Product: {
            name: 'Product 1',
            status: true, // Produto disponível
            stock: 1, // Estoque insuficiente
          },
          quantity: 2, // Quantidade maior que o estoque disponível
        },
      ];

      try {
        await ordersService.validateCartStock(mockCart);
      } catch (error) {
        expect(error).toEqual(conflictError('Insufficient stock for product "Product 1". Available: 1, Requested: 2'));
      }
    });

    it('should validate cart successfully if all products are available and have sufficient stock', async () => {
      const mockCart = [
        {
          Product: {
            name: 'Product 1',
            status: true,
            stock: 10,
          },
          quantity: 2, // Estoque suficiente
        },
        {
          Product: {
            name: 'Product 2',
            status: true,
            stock: 5,
          },
          quantity: 3, // Estoque suficiente
        },
      ];

      try {
        await ordersService.validateCartStock(mockCart);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  describe('getByClientId', () => {
    it('should return orders by client ID', async () => {
      const mockOrders = [{ id: 1, clientId: 1, total: 100 }];

      (ordersRepository.findByClientId as jest.Mock).mockResolvedValue(mockOrders);

      const result = await ordersService.getByClientId(mockUser.id);

      expect(result).toEqual(mockOrders);
      expect(ordersRepository.findByClientId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getById', () => {
    it('should return order by ID for admin user', async () => {
      const mockOrder = { id: 1, Client: { userId: 1 }, total: 100 };
      const adminUser: SecuryUser = { ...mockUser, type: 'admin' };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getById(1, adminUser);

      expect(result).toEqual({ id: 1, total: 100 });
      expect(ordersRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return order by ID for client user', async () => {
      const mockOrder = { id: 1, Client: { userId: 1 }, total: 100 };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getById(1, mockUser);

      expect(result).toEqual({ id: 1, total: 100 });
      expect(ordersRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if order does not exist', async () => {
      (ordersRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.getById(1, mockUser);
      } catch (error) {
        expect(error).toEqual(notFoundError('Order not found'));
      }
    });

    it("should throw unauthorized error if client user tries to access another user's order", async () => {
      const mockOrder = { id: 1, Client: { userId: 2 }, total: 100 };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      try {
        await ordersService.getById(1, mockUser);
      } catch (error) {
        expect(error).toEqual(unauthorizedError('You are not allowed to access orders from other users'));
      }
    });
  });

  describe('getAll', () => {
    it('should return paginated orders with filters', async () => {
      const mockOrders = [{ id: 1, total: 100 }];
      const mockTotal = 1;
      const params: GetAllOrdersParams = {
        page: 1,
        limit: 10,
        status: 'RECEBIDO',
        minTotal: 50,
        maxTotal: 150,
        minDate: '2023-01-01',
        maxDate: '2023-12-31',
      };

      (ordersRepository.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (ordersRepository.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await ordersService.getAll(params);

      expect(result).toEqual({ data: mockOrders, total: mockTotal, page: 1, limit: 10 });
      expect(ordersRepository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          status: { equals: 'RECEBIDO' },
          total: { gte: 50, lte: 150 },
          createdAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
        },
      });
      expect(ordersRepository.count).toHaveBeenCalledWith({
        status: { equals: 'RECEBIDO' },
        total: { gte: 50, lte: 150 },
        createdAt: {
          gte: new Date('2023-01-01'),
          lte: new Date('2023-12-31'),
        },
      });
    });
  });

  describe('simulatePayment', () => {
    it('should simulate payment successfully', async () => {
      const mockOrder = { id: 1, status: 'RECEBIDO' };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.simulatePayment(1);

      expect(result.success).toBeDefined();
      expect(ordersRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if order does not exist', async () => {
      (ordersRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.simulatePayment(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Order not found'));
      }
    });

    it('should throw bad request error if order has already been paid', async () => {
      const mockOrder = { id: 1, status: 'PAID' };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      try {
        await ordersService.simulatePayment(1);
      } catch (error) {
        expect(error).toEqual(badRequestError('Order has already been paid'));
      }
    });
  });

  describe('paymentDone', () => {
    it('should complete payment successfully', async () => {
      const mockOrder = { id: 1, status: 'RECEBIDO' };

      (ordersRepository.completePayment as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.paymentDone(1);

      expect(result).toEqual(mockOrder);
      expect(ordersRepository.completePayment).toHaveBeenCalledWith(1, 'EM_PREPARACAO');
    });
  });

  describe('checkStockAvailability', () => {
    it('should check stock availability successfully', async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, stock: 10, status: true };

      (productRepository.findStockById as jest.Mock).mockResolvedValue(mockProduct);

      try {
        await ordersService.checkStockAvailability(items);
      } catch (error) {
        expect(error).toBeUndefined();
      }
      expect(productRepository.findStockById).toHaveBeenCalledWith(1);
    });

    it('should throw conflict error if product is not found', async () => {
      const items = [{ productId: 1, quantity: 2 }];

      (productRepository.findStockById as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.checkStockAvailability(items);
      } catch (error) {
        expect(error).toEqual(
          conflictError('Payment failed because some products have any problem', [
            { productId: 1, reason: 'Product not found' },
          ]),
        );
      }
    });

    it('should throw conflict error if product is disabled', async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, stock: 10, status: false };

      (productRepository.findStockById as jest.Mock).mockResolvedValue(mockProduct);

      try {
        await ordersService.checkStockAvailability(items);
      } catch (error) {
        expect(error).toEqual(
          conflictError('Payment failed because some products have any problem', [
            { productId: 1, reason: 'Product is disabled' },
          ]),
        );
      }
    });

    it('should throw conflict error if product stock is insufficient', async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, stock: 1, status: true };

      (productRepository.findStockById as jest.Mock).mockResolvedValue(mockProduct);

      try {
        await ordersService.checkStockAvailability(items);
      } catch (error) {
        expect(error).toEqual(
          conflictError('Payment failed because some products have any problem', [
            { productId: 1, reason: 'Insufficient stock', availableStock: 1, requestedQuantity: 2 },
          ]),
        );
      }
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = { id: 1, status: 'RECEBIDO' };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (ordersRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'EM_PREPARACAO' });

      const result = await ordersService.updateStatus(1, 'EM_PREPARACAO');

      expect(result).toEqual({ ...mockOrder, status: 'EM_PREPARACAO' });
      expect(ordersRepository.findById).toHaveBeenCalledWith(1);
      expect(ordersRepository.updateStatus).toHaveBeenCalledWith(1, 'EM_PREPARACAO');
    });

    it('should throw not found error if order does not exist', async () => {
      (ordersRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.updateStatus(1, 'EM_PREPARACAO');
      } catch (error) {
        expect(error).toEqual(notFoundError('Order not found'));
      }
    });

    it('should throw bad request error if order already has this status', async () => {
      const mockOrder = { id: 1, status: 'EM_PREPARACAO' };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

      try {
        await ordersService.updateStatus(1, 'EM_PREPARACAO');
      } catch (error) {
        expect(error).toEqual(badRequestError('Order already has this status'));
      }
    });
  });

  describe('exclude', () => {
    it('should delete order successfully', async () => {
      const mockOrder = { id: 1 };

      (ordersRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (ordersRepository.deleteById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.exclude(1);

      expect(result).toEqual(mockOrder);
      expect(ordersRepository.findById).toHaveBeenCalledWith(1);
      expect(ordersRepository.deleteById).toHaveBeenCalledWith(1);
    });

    it('should throw not found error if order does not exist', async () => {
      (ordersRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await ordersService.exclude(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Order not found'));
      }
    });
  });
});
