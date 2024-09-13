import { productRepository } from '@/repositories';
import { CreateProductInput } from '@/schemas';

async function create(data: CreateProductInput) {
  const product = await productRepository.create(data);

  return product;
}

export const productService = {
  create,
};
