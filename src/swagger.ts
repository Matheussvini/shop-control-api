import { $Enums } from '@prisma/client';
import { OpenAPIV3_1 } from 'openapi-types';

function processV3_1(doc: OpenAPIV3_1.Document) {}

export const swaggerDocument: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'Shop Control API Documentation',
    description:
      'In this documentation you will be able to consult the API end-points and also test all available routes. Do not forget to register and carry out the authentication.',
    contact: {
      email: 'matheussvini@outlook.com',
      url: 'https://www.linkedin.com/in/mvsd/',
    },
    version: '1.0.0',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}`,
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'Users management',
    },
    {
      name: 'Clients',
      description: 'Clients management',
    },
    {
      name: 'Products',
      description: 'Products management',
    },
    {
      name: 'Carts',
      description: 'Shopping cart management',
    },
    {
      name: 'Reports',
      description: 'Reports management',
    },
  ],
  paths: {
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Confirmation email sent, your user will be created after confirmation',
          },
          400: {
            description: 'Bad request',
          },
          409: {
            description: 'Conflict - Email already exists',
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Get all users with pagination - only admin',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            type: 'number',
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            type: 'number',
            description: 'Limit of users per page',
          },
          {
            in: 'query',
            name: 'username',
            required: false,
            type: 'string',
            description: 'Username filter',
          },
          {
            in: 'query',
            name: 'email',
            required: false,
            type: 'string',
            description: 'Email filter',
          },
          {
            in: 'query',
            name: 'type',
            required: false,
            type: 'string',
            description: 'User type filter',
          },
        ],
        responses: {
          200: {
            description: 'Users found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Users',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/users/confirm-email/{token}': {
      get: {
        tags: ['Users'],
        summary: 'Confirm user email',
        description: 'Confirm user email to create the user',
        parameters: [
          {
            in: 'path',
            name: 'token',
            required: true,
            type: 'number',
            description: 'Token received by email',
          },
        ],
        responses: {
          200: {
            description: 'Email confirmed, user created successfully!',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Unauthorized - Authentication token invalid',
          },
          404: {
            description: 'Not found - Token not found',
          },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Login user',
        description: 'Login user to get the token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User logged in successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Unauthorized - Email or password invalid',
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        description: 'Get user by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'User id',
          },
        ],
        responses: {
          200: {
            description: 'User found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'User not found',
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update user by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'User id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateUserInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'User not found',
          },
          409: {
            description: 'Conflict - Email already exists',
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete user by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'User id',
          },
        ],
        responses: {
          204: {
            description: 'User deleted successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'User not found',
          },
        },
      },
    },
    '/users/password/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Change user password',
        description: 'Change user password by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'User id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangePasswordInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Invalid password',
          },
          404: {
            description: 'User not found',
          },
        },
      },
    },
    '/users/admin': {
      post: {
        tags: ['Users'],
        summary: 'Create a new admin',
        description: 'Create a new admin user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Confirmation email sent, your user will be created after confirmation',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Only admin can create other admin',
          },
          409: {
            description: 'Conflict - Email already exists',
          },
        },
      },
    },
    '/clients': {
      post: {
        tags: ['Clients'],
        summary: 'Create a new client',
        description: 'Create a new client. It is necessary to be an user to create a client',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/getAllClientsInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Client created successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'User not found',
          },
          409: {
            description: 'Conflict - Client already exists for this user',
          },
        },
      },
      get: {
        tags: ['Clients'],
        summary: 'Get all clients',
        description: 'Get all clients with pagination - only admin',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            type: 'number',
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            type: 'number',
            description: 'Limit of clients per page',
          },
          {
            in: 'query',
            name: 'fullName',
            required: false,
            type: 'string',
            description: 'Client full name filter',
          },
          {
            in: 'query',
            name: 'contact',
            required: false,
            type: 'string',
            description: 'Client contact filter',
          },
          {
            in: 'query',
            name: 'status',
            required: false,
            type: 'boolean',
            description: 'Client status filter',
          },
        ],
        responses: {
          200: {
            description: 'Clients found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Clients',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Get client by id',
        description: 'Get client by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Client id',
          },
        ],
        responses: {
          200: {
            description: 'Client found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Client',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Client not found',
          },
        },
      },
      patch: {
        tags: ['Clients'],
        summary: 'Update client',
        description: 'Update client by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Client id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateClientInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Client updated successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Client not found',
          },
        },
      },
      delete: {
        tags: ['Clients'],
        summary: 'Delete client',
        description: 'Delete client by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Client id',
          },
        ],
        responses: {
          204: {
            description: 'Client deleted successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Client not found',
          },
        },
      },
    },
    '/products': {
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Create a new product - only admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateProductInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Get all products with pagination',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            type: 'number',
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            type: 'number',
            description: 'Limit of products per page',
          },
          {
            in: 'query',
            name: 'name',
            required: false,
            type: 'string',
            description: 'Product name filter',
          },
          {
            in: 'query',
            name: 'minPrice',
            required: false,
            type: 'number',
            description: 'Product min price filter',
          },
          {
            in: 'query',
            name: 'maxPrice',
            required: false,
            type: 'number',
            description: 'Product max price filter',
          },
          {
            in: 'query',
            name: 'minStock',
            required: false,
            type: 'number',
            description: 'Product min stock filter',
          },
          {
            in: 'query',
            name: 'maxStock',
            required: false,
            type: 'number',
            description: 'Product max stock filter',
          },
          {
            in: 'query',
            name: 'status',
            required: false,
            type: 'boolean',
            description: 'Product status filter',
          },
        ],
        responses: {
          200: {
            description: 'Products found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Products',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by id',
        description: 'Get product by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Product id',
          },
        ],
        responses: {
          200: {
            description: 'Product found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found',
          },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product',
        description: 'Update product by id - only admin',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Product id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProductInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Product updated successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found',
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        description: 'Delete product by id - only admin',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Product id',
          },
        ],
        responses: {
          204: {
            description: 'Product deleted successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found',
          },
        },
      },
    },
    '/products/upload/{productId}': {
      post: {
        tags: ['Products'],
        summary: 'Upload a product image',
        description: 'Upload product image by productId - only admin',
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            type: 'number',
            description: 'Product id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Image uploaded successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found',
          },
        },
      },
    },
    '/products/image/{productId}': {
      delete: {
        tags: ['Products'],
        summary: 'Delete product image',
        description: 'Delete product image by id - only admin',
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            type: 'number',
            description: 'Product id',
          },
        ],
        responses: {
          200: {
            description: 'Image deleted successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found',
          },
        },
      },
    },
    '/carts': {
      post: {
        tags: ['Carts'],
        summary: 'Change cart',
        description: 'Change products in cart',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangeCartInput',
              },
            },
          },
        },
        responses: {
          201: {
            description:
              'Product added to cart successfully / Product removed from cart / Product quantity updated in cart',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Product not found / Product is not available / Product has insufficient stock',
          },
        },
      },
      get: {
        tags: ['Carts'],
        summary: 'Get all carts',
        description: 'Get all carts with pagination - only admin',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            type: 'number',
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            type: 'number',
            description: 'Limit of carts per page',
          },
          {
            in: 'query',
            name: 'minDate',
            required: false,
            type: 'string',
            description: 'Minimum date filter',
          },
          {
            in: 'query',
            name: 'maxDate',
            required: false,
            type: 'string',
            description: 'Maximum date filter',
          },
          {
            in: 'query',
            name: 'minPrice',
            required: false,
            type: 'number',
            description: 'Minimum price filter',
          },
          {
            in: 'query',
            name: 'maxPrice',
            required: false,
            type: 'number',
            description: 'Maximum price filter',
          },
          {
            in: 'query',
            name: 'productName',
            required: false,
            type: 'string',
            description: 'Product name filter',
          },
        ],
        responses: {
          200: {
            description: 'Carts found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Carts',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/carts/{clientId}': {
      get: {
        tags: ['Carts'],
        summary: 'Get cart by clientId',
        description: 'Get cart by clientId',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            type: 'number',
            description: 'Client id',
          },
        ],
        responses: {
          200: {
            description: 'Cart found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Cart',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Shopping cart is empty',
          },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        description: 'Create a new order - only client - products in cart will be used',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateOrderInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order created successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Client not found / Shopping cart is empty',
          },
          409: {
            description: 'Conflict - Product is unavailable / Insufficient stock for product',
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get all orders',
        description: 'Get all orders with pagination - only admin',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            type: 'number',
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            type: 'number',
            description: 'Limit of orders per page',
          },
          {
            in: 'query',
            name: 'minDate',
            required: false,
            type: 'string',
            description: 'Minimum date filter',
          },
          {
            in: 'query',
            name: 'maxDate',
            required: false,
            type: 'string',
            description: 'Maximum date filter',
          },
          {
            in: 'query',
            name: 'minTotal',
            required: false,
            type: 'number',
            description: 'Minimum total filter',
          },
          {
            in: 'query',
            name: 'maxTotal',
            required: false,
            type: 'number',
            description: 'Maximum total filter',
          },
          {
            in: 'query',
            name: 'status',
            required: false,
            type: $Enums.OrderStatus,
            description: 'Order status filter',
          },
        ],
        responses: {
          200: {
            description: 'Orders found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Orders',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by id',
        description: 'Get order by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Order id',
          },
        ],
        responses: {
          200: {
            description: 'Order found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Order not found',
          },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete order',
        description: 'Delete order by id - only admin',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            type: 'number',
            description: 'Order id',
          },
        ],
        responses: {
          204: {
            description: 'Order deleted successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Order not found',
          },
        },
      },
    },
    '/orders/client/{clientId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get orders by clientId',
        description: 'Get orders by clientId',
        parameters: [
          {
            in: 'path',
            name: 'clientId',
            required: true,
            type: 'number',
            description: 'Client id',
          },
        ],
        responses: {
          200: {
            description: 'Orders found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Orders',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
        },
      },
    },
    '/orders/payment/{orderId}': {
      post: {
        tags: ['Orders'],
        summary: 'Do payment',
        description: 'Do payment for order',
        parameters: [
          {
            in: 'path',
            name: 'orderId',
            required: true,
            type: 'number',
            description: 'Order id',
          },
        ],
        responses: {
          200: {
            description: 'Payment done successfully',
          },
          400: {
            description: 'Bad request / Order has already been paid',
          },
          401: {
            description: 'Authentication token invalid',
          },
          402: {
            description: 'Payment failed',
          },
          404: {
            description: 'Order not found',
          },
        },
      },
    },
    '/orders/status/{orderId}/{status}': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
        description: 'Update order status by orderId',
        parameters: [
          {
            in: 'path',
            name: 'orderId',
            required: true,
            type: 'number',
            description: 'Order id',
          },
          {
            in: 'path',
            name: 'status',
            required: true,
            type: $Enums.OrderStatus,
            description: 'Order status',
          },
        ],
        responses: {
          200: {
            description: 'Order status updated successfully',
          },
          400: {
            description: 'Bad request',
          },
          401: {
            description: 'Authentication token invalid',
          },
          404: {
            description: 'Order not found',
          },
        },
      },
    },
  },
};
