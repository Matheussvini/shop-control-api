import { productService } from './products-service';
import { badRequestError, notFoundError } from '@/errors';
import { ChangeProductToCartInput } from '@/schemas';
import { cartsRepository } from '@/repositories';

async function changeProduct({ clientId, productId, quantity }: ChangeProductToCartInput) {
  const product = await productService.getById(productId);

  if (!product) throw notFoundError('Product not found');
  if (!product.status) throw notFoundError('Product is not available');
  if (product.stock < quantity) throw badRequestError('Product has insufficient stock');

  const hasProductInCart = await cartsRepository.findProduct({ clientId, productId });

  if (hasProductInCart) {
    if (product.stock < hasProductInCart.quantity + quantity) throw badRequestError('Product has insufficient stock');
    if (hasProductInCart.quantity + quantity <= 0) {
      await cartsRepository.removeProduct(hasProductInCart.id);
      return { message: 'Product removed from cart' };
    } else {
      const cart = await cartsRepository.updateProduct({
        id: hasProductInCart.id,
        quantity: hasProductInCart.quantity + quantity,
      });
      return { message: 'Product quantity updated in cart', data: cart };
    }
  } else {
    if (quantity <= 0) throw badRequestError('Quantity must be greater than zero to add product to cart');
    const cart = await cartsRepository.addProduct({ clientId, productId, quantity });
    return { message: 'Product added to cart successfully!', data: cart };
  }
}

async function getCart(clientId: number) {
  let cart = await cartsRepository.getCart(clientId);
  if (!cart) throw notFoundError('Shopping cart is empty');

  cart = cart.map((item) => ({
    ...item,
    subtotal: item.Product.price * item.quantity,
  }));
  const total = cart.reduce((acc, item) => acc + item.Product.price * item.quantity, 0);

  return { total, clientId, cart };
}

async function getAll({ page, limit, minDate, maxDate, minPrice, maxPrice, productName }) {
  const filters: any = {};

  if (minDate || maxDate) {
    filters.date = {};
    if (minDate) filters.date.gte = minDate;
    if (maxDate) filters.date.lte = maxDate;
  }

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.gte = minPrice;
    if (maxPrice) filters.price.lte = maxPrice;
  }
  if (productName) filters.productName = productName;
  filters.page = page;
  filters.limit = limit;
  const [carts, totalCount] = await Promise.all([
    cartsRepository.findMany(filters),
    cartsRepository.countCarts(filters),
  ]);

  return {
    carts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export const cartsService = {
  changeProduct,
  getCart,
  getAll,
};
