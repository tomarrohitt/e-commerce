Getting Started
Follow these steps to set up and run the application locally.

1. Clone the Repository
Bash

git clone https://github.com/tomarrohitt/e-commerce ecommerce-microservice
cd ecommerce-microservice
2. Environment Configuration
You need to set up the environment variables for each service. You can rename the example files in one shot using the following command:

Bash

# Linux/macOS
for dir in apps/*; do
  if [ -f "$dir/.env.example" ]; then
    cp "$dir/.env.example" "$dir/.env"
  fi
done
Required Secrets
For full functionality (image uploads, emails, payments), you must populate the following secrets in the .env files for the Identity, Catalog, Invoice, and Email services.

AWS (S3 for Image Uploads)

Bash

AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SMTP (Email Service)

Bash

SMTP_HOST=smtp-relay.brevo.com
SMTP_SECURE=false
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_verified_sender_email
Stripe (Payments)

Bash

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
3. Start Infrastructure
Spin up the required infrastructure (PostgreSQL, Redis, RabbitMQ) using Docker Compose. This command does not start the application services, only the backing services.

Bash

# Run from the root of the monorepo
docker compose up -d postgres redis rabbitmq
Note: You can also configure the services to point to your own managed database/broker instances by updating the .env files.

4. Install & Run
We use a unified setup script to install dependencies, generate Prisma clients, deploy database migrations, build shared packages, and start the application.

Bash

pnpm run setup
The services will start on ports 4000 through 4005 and 5000.

API Documentation
API Gateway (api-gateway)
The single entry point for all client requests.

Identity Service (identity)
Auth: /api/auth/sign-up/email, /api/auth/sign-in/email, /api/auth/logout, /api/auth/refresh-token

Profile: /api/user/profile (GET/PATCH), /api/user/get-upload-url (S3)

Addresses: /api/addresses (CRUD), /api/addresses/:id/default

Admin: /api/admin/users (CRUD)

Catalog Service (catalog)
Products: /api/products (CRUD)

Categories: /api/categories (CRUD)

Reviews: /api/reviews (CRUD)

Cart Service (cart)
Cart: /api/cart (GET/POST/DELETE), /api/cart/:productId (PATCH/DELETE)

Orders Service (orders)
Orders: /api/orders (Create/List/Cancel)

Admin: /api/admin/orders (List/Status Update)

Webhooks: /api/orders/webhook (Stripe)

Invoice Service (invoice)
Download: /api/invoice/download/:orderId

Email Service (email)
A worker service that consumes events (User Registered, Order Placed) from RabbitMQ to send emails.