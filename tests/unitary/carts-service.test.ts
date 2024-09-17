import { cartsService } from '@/services/carts-service';
import { productService } from '@/services/products-service';
import { cartsRepository } from '@/repositories';
import { badRequestError, notFoundError } from '@/errors';

jest.mock('@/services/products-service');
jest.mock('@/repositories');

describe('cartsService', () => {
  describe('changeProduct', () => {
    it('should throw not found error if product does not exist', async () => {
      (productService.getById as jest.Mock).mockResolvedValue(null);

      try {
        await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 1 });
      } catch (error) {
        expect(error).toEqual(notFoundError('Product not found'));
      }
    });

    it('should throw not found error if product is not available', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: false });

      try {
        await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 1 });
      } catch (error) {
        expect(error).toEqual(notFoundError('Product is not available'));
      }
    });

    it('should throw bad request error if product has insufficient stock', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: true, stock: 0 });

      try {
        await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 1 });
      } catch (error) {
        expect(error).toEqual(badRequestError('Product has insufficient stock'));
      }
    });

    it('should add product to cart if it does not exist in cart', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: true, stock: 10 });
      (cartsRepository.findProduct as jest.Mock).mockResolvedValue(null);
      (cartsRepository.addProduct as jest.Mock).mockResolvedValue({ id: 1, clientId: 1, productId: 1, quantity: 1 });

      const result = await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 1 });

      expect(result).toEqual({
        message: 'Product added to cart successfully!',
        data: { id: 1, clientId: 1, productId: 1, quantity: 1 },
      });
    });

    it('should update product quantity in cart if it exists', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: true, stock: 10 });
      (cartsRepository.findProduct as jest.Mock).mockResolvedValue({ id: 1, quantity: 1 });
      (cartsRepository.updateProduct as jest.Mock).mockResolvedValue({ id: 1, clientId: 1, productId: 1, quantity: 2 });

      const result = await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 1 });

      expect(result).toEqual({
        message: 'Product quantity updated in cart',
        data: { id: 1, clientId: 1, productId: 1, quantity: 2 },
      });
    });

    it('should remove product from cart if quantity becomes zero or less', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: true, stock: 10 });
      (cartsRepository.findProduct as jest.Mock).mockResolvedValue({ id: 1, quantity: 1 });
      (cartsRepository.removeProduct as jest.Mock).mockResolvedValue(1);

      const result = await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: -1 });

      expect(result).toEqual({ message: 'Product removed from cart' });
    });

    it('should update product quantity in cart to the maximum available stock', async () => {
      (productService.getById as jest.Mock).mockResolvedValue({ status: true, stock: 5 });
      (cartsRepository.findProduct as jest.Mock).mockResolvedValue({ id: 1, quantity: 3 });
      (cartsRepository.updateProduct as jest.Mock).mockResolvedValue({ id: 1, clientId: 1, productId: 1, quantity: 5 });

      const result = await cartsService.changeProduct({ clientId: 1, productId: 1, quantity: 2 });

      expect(result).toEqual({
        message: 'Product quantity updated in cart',
        data: { id: 1, clientId: 1, productId: 1, quantity: 5 },
      });
    });
  });

  describe('getCart', () => {
    it('should throw not found error if cart is empty', async () => {
      (cartsRepository.getCart as jest.Mock).mockResolvedValue(null);

      try {
        await cartsService.getCart(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Shopping cart is empty'));
      }
    });

    it('should return cart with total and subtotal', async () => {
      const cartItems = [
        { Product: { price: 10 }, quantity: 2 },
        { Product: { price: 20 }, quantity: 1 },
      ];
      (cartsRepository.getCart as jest.Mock).mockResolvedValue(cartItems);

      const result = await cartsService.getCart(1);

      expect(result).toEqual({
        total: 40,
        clientId: 1,
        cart: [
          { Product: { price: 10 }, quantity: 2, subtotal: 20 },
          { Product: { price: 20 }, quantity: 1, subtotal: 20 },
        ],
      });
    });

    it('should throw not found error if a product in cart has zero or negative quantity', async () => {
      const cartItems = [
        { Product: { price: 10 }, quantity: 0 },
        { Product: { price: 20 }, quantity: -1 },
      ];
      (cartsRepository.getCart as jest.Mock).mockResolvedValue(cartItems);

      try {
        await cartsService.getCart(1);
      } catch (error) {
        expect(error).toEqual(notFoundError('Shopping cart is empty'));
      }
    });
  });

  describe('getAll', () => {
    it('should return paginated carts without any filters', async () => {
      const mockCarts = [{ id: 1, productName: 'Product 1', price: 100, date: '2023-01-01' }];
      const mockTotalCount = 1;

      (cartsRepository.findMany as jest.Mock).mockResolvedValue(mockCarts);
      (cartsRepository.countCarts as jest.Mock).mockResolvedValue(mockTotalCount);

      const result = await cartsService.getAll({
        page: 1,
        limit: 10,
        minDate: undefined,
        maxDate: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        productName: undefined,
      });

      expect(result).toEqual({
        carts: mockCarts,
        totalCount: mockTotalCount,
        totalPages: 1,
        currentPage: 1,
      });

      expect(cartsRepository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });

      expect(cartsRepository.countCarts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should return paginated carts with all filters (date range, price range, product name)', async () => {
      const mockCarts = [{ id: 1, productName: 'Product 1', price: 100, date: '2023-01-01' }];
      const mockTotalCount = 10;

      const filters = {
        page: 2,
        limit: 5,
        minPrice: 50,
        maxPrice: 200,
        minDate: '2023-01-01',
        maxDate: '2023-12-31',
        productName: 'Product 1',
      };

      (cartsRepository.findMany as jest.Mock).mockResolvedValue(mockCarts);
      (cartsRepository.countCarts as jest.Mock).mockResolvedValue(mockTotalCount);

      const result = await cartsService.getAll(filters);

      expect(result).toEqual({
        carts: mockCarts,
        totalCount: mockTotalCount,
        totalPages: 2,
        currentPage: 2,
      });

      expect(cartsRepository.findMany).toHaveBeenCalledWith({
        price: { gte: 50, lte: 200 },
        date: { gte: '2023-01-01', lte: '2023-12-31' },
        productName: 'Product 1',
        page: 2,
        limit: 5,
      });

      expect(cartsRepository.countCarts).toHaveBeenCalledWith({
        price: { gte: 50, lte: 200 },
        date: { gte: '2023-01-01', lte: '2023-12-31' },
        productName: 'Product 1',
        page: 2,
        limit: 5,
      });
    });
  });
});
