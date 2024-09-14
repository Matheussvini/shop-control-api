import { prisma } from '@/config';
import { ChangeProductToCartInput } from '@/schemas';

async function findProduct(data: Omit<ChangeProductToCartInput, 'quantity'>) {
  return await prisma.cartItem.findFirst({
    where: data,
  });
}

async function addProduct(data: ChangeProductToCartInput) {
  return await prisma.cartItem.create({
    data,
    select: { clientId: true, productId: true, quantity: true },
  });
}

async function updateProduct({ id, quantity }) {
  return await prisma.cartItem.update({
    where: { id },
    select: { clientId: true, productId: true, quantity: true },
    data: { quantity },
  });
}

async function removeProduct(id: number) {
  return await prisma.cartItem.delete({
    where: { id },
  });
}

async function getCart(clientId: number) {
  return await prisma.cartItem.findMany({
    where: { clientId },
    select: {
      productId: true,
      quantity: true,
      Product: {
        select: {
          name: true,
          price: true,
          stock: true,
          Images: {
            select: {
              path: true,
            },
          },
        },
      },
    },
  });
}

function convertBigIntToNumber(obj: any): any {
  if (typeof obj === 'bigint') {
    return Number(obj);
  } else if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntToNumber(item));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertBigIntToNumber(value)]));
  }
  return obj;
}

function buildFilterQuery({
  minDate,
  maxDate,
  minPrice,
  maxPrice,
  productName,
}: {
  minDate?: string;
  maxDate?: string;
  minPrice?: number;
  maxPrice?: number;
  productName?: string;
}) {
  let filterQuery = `WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (minDate) {
    filterQuery += ` AND ci."createdAt" >= COALESCE($${paramIndex}::date, '1970-01-01'::date)`;
    params.push(minDate);
    paramIndex++;
  }

  if (maxDate) {
    filterQuery += ` AND ci."createdAt" <= COALESCE($${paramIndex}::date, CURRENT_DATE::date)`;
    params.push(maxDate);
    paramIndex++;
  }

  if (minPrice != null || maxPrice != null) {
    filterQuery += `
      AND ci."clientId" IN (
        SELECT ci2."clientId"
        FROM cart_items ci2
        JOIN products p2 ON ci2."productId" = p2.id
        GROUP BY ci2."clientId"
        HAVING
          SUM(ci2."quantity" * p2.price) >= COALESCE($${paramIndex}, 0)
          AND SUM(ci2."quantity" * p2.price) <= COALESCE($${paramIndex + 1}, 99999999)
      )
    `;
    params.push(minPrice || 0, maxPrice || 99999999);
    paramIndex += 2;
  }

  if (productName) {
    filterQuery += `
      AND EXISTS (
        SELECT 1
        FROM products p2
        WHERE p2.id = ci."productId"
        AND p2.name ILIKE CONCAT('%', $${paramIndex}, '%')
      )
    `;
    params.push(productName);
    paramIndex++;
  }

  return { filterQuery, params, paramIndex };
}

async function findMany({ page, limit, minDate, maxDate, minPrice, maxPrice, productName }) {
  const offset = (page - 1) * limit;

  const { filterQuery, params, paramIndex } = buildFilterQuery({ minDate, maxDate, minPrice, maxPrice, productName });

  const query = `
    SELECT
      ci."clientId",
      SUM(ci."quantity" * p.price) AS totalPrice,
      COUNT(DISTINCT ci."productId") AS distinctProductCount,
      SUM(ci."quantity") AS totalItemCount,
      json_agg(json_build_object(
        'productId', ci."productId",
        'productName', p.name,
        'quantity', ci."quantity",
        'price', p.price,
        'stock', p.stock
      )) AS products
    FROM
      cart_items ci
    JOIN
      products p ON ci."productId" = p.id
    JOIN
      clients c ON ci."clientId" = c.id
    ${filterQuery}
    GROUP BY
      ci."clientId"
    ORDER BY
      totalPrice DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const rawCarts = await prisma.$queryRawUnsafe(query, ...params);
  const carts = convertBigIntToNumber(rawCarts);
  return carts;
}

async function countCarts({ minDate, maxDate, minPrice, maxPrice, productName }) {
  const { filterQuery, params } = buildFilterQuery({ minDate, maxDate, minPrice, maxPrice, productName });

  const query = `
    SELECT
      COUNT(DISTINCT ci."clientId") AS total
    FROM
      cart_items ci
    JOIN
      products p ON ci."productId" = p.id
    ${filterQuery}
  `;

  const rawCount = await prisma.$queryRawUnsafe(query, ...params);
  const result = convertBigIntToNumber(rawCount);

  return result[0]?.total || 0;
}

export const cartsRepository = {
  addProduct,
  findProduct,
  updateProduct,
  removeProduct,
  getCart,
  findMany,
  countCarts,
};
