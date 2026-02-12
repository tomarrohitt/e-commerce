Here’s your setup guide rewritten so a developer can follow it without squinting or guessing.

Local Setup Guide

This project is a microservices-based e-commerce system. You will:

Clone the repo

Configure environment variables

Start infrastructure (DB, cache, broker)

Run the unified setup script

If you skip steps or half-configure secrets, things will break. Follow the order.

1️⃣ Clone the Repository

````git clone https://github.com/tomarrohitt/e-commerce ecommerce-microservice
cd ecommerce-microservice```

2️⃣ Configure Environment Variables

Each service has its own .env file.

Instead of manually copying them one by one, run:

# Linux / macOS

for dir in apps/\*; do
if [ -f "$dir/.env.example" ]; then
cp "$dir/.env.example" "$dir/.env"
fi
done

Now edit the .env files and fill in the required secrets.

If you leave required secrets empty, related features will fail.

🔐 Required Secrets

These are mandatory for full functionality.

AWS S3 (Image Uploads)

Used by: Identity, Catalog, Invoice services.

AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

Without this:

Profile image upload will fail

Product image upload will fail

SMTP (Email Service)

Used by: Email service.

SMTP_HOST=smtp-relay.brevo.com
SMTP_SECURE=false
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_verified_sender_email

Without this:

Registration emails won’t send

Order confirmation emails won’t send

Stripe (Payments)

Used by: Orders service.

STRIPE*SECRET_KEY=sk_test*...
STRIPE*WEBHOOK_SECRET=whsec*...
STRIPE*PUBLISHABLE_KEY=pk_test*...

Without this:

Checkout won’t work

Webhooks will fail

Orders won’t confirm properly

3️⃣ Start Infrastructure

This project depends on:

PostgreSQL

Redis

RabbitMQ

Start them with Docker:

docker compose up -d postgres redis rabbitmq

Important:

This does NOT start application services.

It only starts infrastructure.

You can point services to managed cloud instances instead by editing .env.

4️⃣ Install and Run Everything

Run the unified setup script from the project root:

pnpm run setup

This script will:

Install all dependencies

Generate Prisma clients

Run database migrations

Build shared packages

Start all services

If this fails, don’t retry blindly. Read the error. It’s almost always:

Missing env variable

Database not running

Port conflict

🌐 Service Ports

After successful startup, services will run on:

4000 – 4005
5000

📚 API Overview
API Gateway

Single entry point for all client requests.

Identity Service

Auth:

POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/logout
POST /api/auth/refresh-token

Profile:

GET /api/user/profile
PATCH /api/user/profile
GET /api/user/get-upload-url

Addresses:

CRUD /api/addresses
PATCH /api/addresses/:id/default

Admin:

CRUD /api/admin/users

Catalog Service
CRUD /api/products
CRUD /api/categories
CRUD /api/reviews

Cart Service
GET /api/cart
POST /api/cart
DELETE /api/cart
PATCH /api/cart/:productId
DELETE /api/cart/:productId

Orders Service
POST /api/orders
GET /api/orders
POST /api/orders/cancel
GET /api/admin/orders
PATCH /api/admin/orders
POST /api/orders/webhook (Stripe)

Invoice Service
GET /api/invoice/download/:orderId

Email Service

Background worker consuming RabbitMQ events:

User Registered

Order Placed

No public HTTP API.

✅ Final Checklist Before Running

Docker running

All .env files populated

Stripe keys valid

AWS bucket exists

SMTP credentials verified

Ports 4000–4005 and 5000 free

If all that’s correct, the system will boot cleanly.
````
