# E-Commerce Monorepo

This is a monorepo for a microservices-based e-commerce application. It includes services for identity management, product catalog, shopping cart, orders, invoicing, and email notifications. The project is built with TypeScript, Node.js, and Express.js, and it uses a variety of technologies including Prisma, PostgreSQL, Redis, RabbitMQ, Docker, and Kubernetes.

## Project Structure

The monorepo is organized into two main directories: `apps` and `packages`.

- **`/apps`**: This directory contains the individual microservices. Each service is a standalone application with its own `package.json` and `Dockerfile`.
- **`/packages`**: This directory contains shared code that is used by multiple services. This includes common utilities, configurations, and types.

## Services

### API Gateway (`api-gateway`)

The API Gateway is the single entry point for all client requests. It is responsible for routing requests to the appropriate downstream service, as well as handling cross-cutting concerns such as authentication, rate limiting, and logging.

### Identity Service (`identity`)

The Identity Service is responsible for managing users, addresses, and authentication.

#### API Endpoints

- **Authentication**
  - `POST /api/auth/sign-up/email`: Register a new user.
  - `POST /api/auth/sign-in/email`: Log in a user.
  - `POST /api/auth/logout`: Log out a user.
  - `POST /api/auth/refresh-token`: Refresh an authentication token.
- **User Profile**
  - `GET /api/user/profile`: Get the current user's profile.
  - `PATCH /api/user/profile`: Update the current user's profile.
  - `POST /api/user/get-upload-url`: Get a pre-signed URL to upload a profile picture.
  - `POST /api/user/confirm-upload`: Confirm the upload of a profile picture.
- **Addresses**
  - `POST /api/addresses`: Create a new address.
  - `GET /api/addresses`: List all addresses for the current user.
  - `GET /api/addresses/default`: Get the default address for the current user.
  - `GET /api/addresses/:id`: Get a specific address.
  - `PATCH /api/addresses/:id`: Update an address.
  - `DELETE /api/addresses/:id`: Delete an address.
  - `PATCH /api/addresses/:id/default`: Set an address as the default.
- **Admin**
  - `GET /api/admin/users`: List all users.
  - `GET /api/admin/users/:id`: Get a specific user.
  - `PATCH /api/admin/users/:id`: Update a user.
  - `DELETE /api/admin/users/:id`: Delete a user.
  - `GET /api/admin/addresses`: List all addresses.
  - `GET /api/admin/addresses/:id`: Get a specific address.
  - `DELETE /api/admin/addresses/:id`: Delete an address.

### Catalog Service (`catalog`)

The Catalog Service is responsible for managing products, categories, and reviews.

#### API Endpoints

- **Products**
  - `GET /api/products`: List all products.
  - `GET /api/products/:id`: Get a specific product.
  - `POST /api/products`: Create a new product (Admin only).
  - `PATCH /api/products/:id`: Update a product (Admin only).
  - `DELETE /api/products/:id`: Delete a product (Admin only).
- **Categories**
  - `GET /api/categories`: List all categories.
  - `GET /api/categories/:id`: Get a specific category.
  - `POST /api/categories`: Create a new category (Admin only).
  - `PATCH /api/categories/:id`: Update a category (Admin only).
  - `DELETE /api/categories/:id`: Delete a category (Admin only).
- **Reviews**
  - `GET /api/reviews`: List all reviews for a product.
  - `POST /api/reviews`: Create a new review.
  - `PATCH /api/reviews/:id`: Update a review.
  - `DELETE /api/reviews/:id`: Delete a review.

### Cart Service (`cart`)

The Cart Service is responsible for managing shopping carts.

#### API Endpoints

- `GET /api/cart`: Get the current user's cart.
- `POST /api/cart`: Add an item to the cart.
- `PATCH /api/cart/:productId`: Update the quantity of an item in the cart.
- `DELETE /api/cart/:productId`: Remove an item from the cart.
- `DELETE /api/cart`: Clear the cart.

### Orders Service (`orders`)

The Orders Service is responsible for managing orders and payments.

#### API Endpoints

- **Customer**
  - `GET /api/orders`: List all orders for the current user.
  - `GET /api/orders/:id`: Get a specific order.
  - `POST /api/orders`: Create a new order.
  - `POST /api/orders/:id/cancel`: Cancel an order.
- **Admin**
  - `GET /api/admin/orders`: List all orders.
  - `PATCH /api/admin/orders/:id/status`: Update the status of an order.
- **Webhook**
  - `POST /api/orders/webhook`: Handle Stripe webhooks.

### Invoice Service (`invoice`)

The Invoice Service is responsible for generating and storing invoices.

#### API Endpoints

- `GET /api/invoice/download/:orderId`: Download the invoice for a specific order.

### Email Service (`email`)

The Email Service is a worker service that is responsible for sending emails. It does not have any API endpoints other than a health check. It consumes events from the event bus and sends emails accordingly (e.g., when a user registers or an order is placed).

## Shared Packages

### Common (`@ecommerce/common`)

This package contains a rich set of reusable components that are shared across all microservices. This includes:

- **Custom Errors:** A set of custom error classes for consistent error handling.
- **Middlewares:** Express middlewares for handling errors and authenticating users.
- **Services:** Common services for logging, Redis, circuit breaking, and event bus communication (RabbitMQ).
- **Outbox Processor:** A reliable way to publish events in a distributed system.
- **Utilities:** A variety of utility functions.
- **Types:** Shared TypeScript types.

### Storage Service (`@ecommerce/storage-service`)

This package provides a high-level abstraction for managing file uploads to a cloud storage service (e.g., AWS S3). It is used by the `identity` and `catalog` services to handle profile pictures and product images.

## Local Development

To run the application locally, you will need to have Docker and Docker Compose installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tomarrohitt/e-commerce
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up the environment:**
    - Create a `.env` file for each service in the `apps` directory, based on the `.env.example` files.
4.  **Start the application:**
    ```bash
    docker-compose up -d
    ```

This will start all the services, as well as the required infrastructure (PostgreSQL, Redis, and RabbitMQ).

## Deployment

The application is designed to be deployed to a Kubernetes cluster. The `/infra/k8s` directory contains the Kubernetes manifests for all the services and infrastructure.

The project uses [Skaffold](https://skaffold.dev/) for a streamlined development and deployment experience on Kubernetes. The `skaffold.yaml` file defines the build and deployment pipeline.

To deploy the application to a Kubernetes cluster, you can use the following command:

```bash
skaffold run
```

This will build the Docker images, push them to a registry, and deploy the application to the cluster.
