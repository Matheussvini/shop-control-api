# Shop Control API

Shop Control API is a robust and scalable backend service designed for simplified e-commerce management. It facilitates managing products, clients, shopping carts, and orders. Built with Node.js, Express, Typescript, and Prisma ORM, it includes advanced features like order management, stock control, and dynamic reporting for sales and revenue.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Deploy](#api-and-database-deployment)
- [Documentation](#documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#how-to-run-for-development)
- [Testing](#how-to-run-tests)
- [Production](#building-and-starting-for-production)
- [Managing Environment Variables](#managing-environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: Register users with email confirmation.
- **Client Management**: Register clients, manage their addresses, and handle their orders.
- **Product Management**: Create, update, and manage products with associated images.
- **Shopping Cart**: Add, update, and remove items from the shopping cart, with stock validation.
- **Order Processing**: Create and manage orders, including payment integration and stock deduction.
- **Reporting**: Generate sales and revenue reports with filters, exportable in CSV format.
- **File Storage**: Upload product images and reports to AWS S3 or local storage.
- **Authentication & Authorization**: Secure API with JWT-based authentication for users and admins.

## Tech Stack

- **Node.js** & **Express**: Backend framework and routing.
- **Typescript**: Strongly typed programming for improved code quality.
- **Prisma ORM**: Database management with PostgreSQL.
- **Joi**: Middleware for input validation.
- **AWS S3**: File storage for images and reports.
- **Swagger**: API documentation and testing.
- **Jest**: Unit testing framework.

# API and Database Deployment

The API and database for this project have been successfully deployed and are now live. You can access them using the following link:

https://shop-control-api.onrender.com/doc/

The integration between the API and the database allows seamless communication and data storage for the application. You can now interact with the API endpoints to perform various operations and utilize the functionality provided by the application.

Feel free to explore and make use of the deployed API and database. If you encounter any issues or have any feedback, please don't hesitate to reach out.

# Documentation

The API documentation can be accessed by visiting the following route:

### [**API Documentation**](https://shop-control-api.onrender.com/doc/)

The documentation provides detailed information about the available endpoints, request and response formats, authentication requirements, and example requests and responses. It serves as a valuable resource for understanding and utilizing the functionalities provided by the API.

# Database Schema

A comprehensive database schema has been designed and implemented for this project. It provides a structured representation of the tables and relationships in the database.

To visualize the model of the database tables, refer to the following image:

![Database Schema](https://github.com/Matheussvini/shop-control-api/blob/main/src/utils/images/db-diagram.png)

The database schema illustrates the organization of entities, their attributes, and the associations between them. It serves as a reference for understanding the data structure and relationships within the application.

Please refer to the image above to gain a better understanding of the database structure and how the tables are interconnected.

## Project Structure

\`\`\`
src/
├── controllers/       # Handles HTTP requests and responses
├── services/          # Business logic for each feature
├── repositories/      # Database interaction using Prisma
├── schemas/           # Joi validation schemas for request data
├── middlewares/       # Error handling and validation middleware
├── tests/             # Unit and integration tests using Jest
└── config/            # Configuration files (DB, S3, etc.)
\`\`\`

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v14+)
- PostgreSQL
- Docker (optional but recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Matheussvini/shop-control-api.git
   cd shop-control-api
   ```

2. Install the dependencies by running the following command:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example`.

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Configure the application by setting the following environment variables:

- `POSTGRES_USERNAME`: PostgreSQL database username
- `POSTGRES_PASSWORD`: PostgreSQL database password
- `POSTGRES_HOST`: PostgreSQL host
- `POSTGRES_PORT`: PostgreSQL port
- `POSTGRES_DATABASE`: PostgreSQL database name
- `PORT`: Port for the server to listen on - default is 4000
- `DATABASE_URL`: URL for connecting to the PostgreSQL database
- `JWT_SECRET`: Secret key for JWT authentication
- `API_URL`: Url for the API Server - for send email confirmation.
- `STORAGE_TYPE`: Storage type for file uploads (e.g., "local" or "s3")
- `AWS_BUCKET_NAME`: AWS S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_DEFAULT_REGION`: AWS region

## How to run for development

1. Clone this repository
2. Install all dependencies

```bash
npm i
```

3. Create a PostgreSQL database with whatever name you want
4. Configure the `.env.development` file using the `.env.example` file (see "Running application locally or inside docker section" for details)
5. Run all migrations

```bash
npm run dev:migration:run
```

6. Seed db

```bash
npm run dev:seed
```

6. Run the back-end in a development environment:

```bash
npm run dev
```

## How to run tests

1. Follow the steps in the last section
1. Configure the `.env.test` file using the `.env.example` file (see "Running application locally or inside docker" section for details)
1. Run all migrations

```bash
npm run migration:run
```

3. Run test:
   (locally)

```bash
npm run test
```

## Building and starting for production

```bash
npm start
```

## Running migrations or generate prisma clients

Before running migrations make sure you have a postgres db running based on `.env.development` or `.env.test` file for each environment. You can start a postgres instance by typing `npm run dev:postgres` or `npm run test:postgres`. The host name is the name of the postgres container inside docker-compose file if you are running the application inside a docker container or localhost if you are running it locally.

You can operate on databases for different environments, but it is necessary to populate correct env variables for each environment first, so in order to perform db operations type the following commands:

- `npm run dev:migration:run` - run migrations for development environment by loading envs from .env.development file. It uses [dotenv-cli](https://github.com/entropitor/dotenv-cli#readme) to load envs from .env.development file.
- `npm run test:migration:run` - the same, but for test environment

- `npm run dev:migration:generate -- --name ATOMIC_OPERATION_NAME` - generate and run migration and prisma client for development environment by loading envs from .env.development file. Replace `ATOMIC_OPERATION_NAME` by the name of the migration you want to generate.

## Managing Environment Variables

When adding new environment variables, follow these steps:

1. Add them to `.env.example`.
2. Add them to local `.env.development` and `.env.test` files.
3. Update `docker-compose.yml` to include the new variables (without values).
4. Add them (production version) to GitHub repository secrets.
5. Update `.github/workflows/test.yml` to include the new variables for CI.

## Contributing

Contributions are welcome! If you have any improvements or bug fixes, feel free to submit a pull request. Additionally, I'm open to suggestions, ideas, or just having a conversation. Feel free to reach out to me through the following channels:

- Email: matheussvini@outlook.com
- LinkedIn: [linkedin.com/in/mvsd](https://linkedin.com/in/mvsd)

## License

This project is licensed under the Mozilla Public License Version 2.0.
