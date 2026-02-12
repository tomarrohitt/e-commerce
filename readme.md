# E-Commerce Platform

This repository contains the source code for a modern, microservices-based e-commerce platform. It includes a full-featured backend with multiple services and a responsive frontend application built with Next.js.

## 🖼️ Preview

![E-Store Homepage](./homepage-screenshot.png)

## 🏛️ Architecture

The platform is built using a microservices architecture to ensure scalability, separation of concerns, and independent deployability of each component.

### Frontend

The frontend is a modern web application built with **Next.js** and **React**. It provides a user-friendly interface for customers to browse products, manage their cart, and place orders.

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Key Features**:
  - Server-Side Rendering (SSR) and Static Site Generation (SSG) for performance.
  - Client and Server Actions for mutations.
  - Protected routes and authentication handling.
  - A comprehensive component library.

### Backend Microservices

The backend is a monorepo managed with `pnpm` and `Turborepo`. It consists of several independent Node.js services, each responsible for a specific business domain.

- **`api-gateway`**: The single entry point for all client requests. It routes traffic to the appropriate downstream service.
- **`identity`**: Manages user authentication, registration, and user profiles.
- **`catalog`**: Responsible for product information, categories, and inventory.
- **`cart`**: Manages shopping carts for both authenticated and anonymous users.
- **`orders`**: Handles order creation, processing, and history.
- **`invoice`**: Generates and manages invoices for completed orders.
- **`email`**: Handles sending transactional emails (e.g., order confirmation).

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/get-started) and Docker Compose

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/tomarrohitt/e-commerce ecommerce-microservice
cd ecommerce-microservice
```

### 1. Backend Setup

The backend services run in Docker containers and are managed via `docker-compose`.

```bash
# Navigate to the backend monorepo
cd ecommerce-monorepo

# Copy the example environment file. You may need to do this for each service in apps/*
# For example:
# cp apps/api-gateway/.env.example apps/api-gateway/.env
# cp apps/cart/.env.example apps/cart/.env
# cp apps/catalog/.env.example apps/catalog/.env

# ... and so on for all services.

Instead of manually copying them one by one, run:

# Linux / macOS
for dir in apps/*; do
  if [ -f "$dir/.env.example" ]; then
    cp "$dir/.env.example" "$dir/.env"
  fi
done
```

Note:\*\* If you leave required secrets empty, related features will fail.

---

## 🔐 Required Secrets

These are mandatory for full functionality.

### AWS S3 (Image Uploads)

**Used by:** Identity, Catalog, Invoice services.

```env
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

> **Without this:**
>
> - Profile image upload will fail
> - Product image upload will fail

### SMTP (Email Service)

**Used by:** Email service.

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_SECURE=false
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_verified_sender_email
```

> **Without this:**
>
> - Registration emails won't send
> - Order confirmation emails won't send

### Stripe (Payments)

**Used by:** Orders service.

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **Without this:**
>
> - Checkout won't work
> - Webhooks will fail
> - Orders won't confirm properly

---

## 3️⃣ Start Infrastructure

This project depends on:

- PostgreSQL
- Redis
- RabbitMQ

Start them with Docker:

```bash
docker compose up -d postgres redis rabbitmq
```

> **⚠️ Important:**
>
> - This does NOT start application services.
> - It only starts infrastructure.
> - You can point services to managed cloud instances instead by editing `.env`.

## 4️⃣ Install and Run Everything

Run the unified setup script from the project root:

```bash
pnpm run setup
```

This script will:

1. Install all dependencies
2. Generate Prisma clients
3. Run database migrations
4. Build shared packages
5. Start all services

> **💡 If this fails:**
>
> Don't retry blindly. Read the error. It's almost always:
>
> - Missing env variable
> - Database not running
> - Port conflict

### 2. Frontend Setup

The frontend can be run directly on the host machine.

```bash
# Navigate to the frontend directory
cd frontend

# Copy the example environment file and configure it
cp .env.example .env.local

# Install dependencies
npm install

# Run the development server
npm run dev
```

After completing these steps, the frontend should be accessible at [http://localhost:3000](http://localhost:3000), and the API Gateway will be listening on the port configured in its environment (e.g., `http://localhost:8000`).

## 🛠️ Technologies Used

- **Monorepo**: `pnpm` workspaces, `Turborepo`
- **Backend**: `Node.js`, `TypeScript`, `Express`, `Prisma`
- **Frontend**: `Next.js`, `React`, `TypeScript`, `Tailwind CSS`
- **Database**: `PostgreSQL`
- **Containerization**: `Docker`, `Docker Compose`
- **Deployment**: `Kubernetes` (configuration provided in `infra/k8s`)
- **Linting/Formatting**: `ESLint`, `Prettier`
