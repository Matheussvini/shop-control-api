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
  const cart = await cartsRepository.getCart(clientId);
  return cart;
}

export const cartsService = {
  changeProduct,
  getCart,
};
