# E-commerce Backend

This is the backend for an e-commerce application. It handles user authentication, product management, orders, and payments. It also includes image uploads to AWS S3.

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL with Prisma
- **Authentication:** `better-auth` (email/password and Google)
- **Validation:** Joi
- **Logging:** Winston
- **File Storage:** AWS S3
- **Email:** Nodemailer
- **Security:** Helmet, CORS
- **Token:** JWT

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables by creating a `.env` file in the root directory. See `.env.example` for a list of required variables.
4.  Run database migrations:
    ```bash
    npx prisma migrate dev
    ```

### Running the application

-   **Development:**
    ```bash
    npm run dev
    ```
-   **Production:**
    ```bash
    npm run build
    npm run start
    ```

## Folder Structure

```
.
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controller/
│   ├── lib/
│   ├── middleware/
│   ├── router/
│   ├── service/
│   ├── types/
│   └── utils/
├── .env
├── index.ts
└── package.json
```

## API Endpoints

-   `/api/auth/*`: Handled by `better-auth` for authentication (login, register, etc.).
-   `/get-upload-url`: Generates a presigned URL for uploading files to S3.
-   `/confirm-upload`: Confirms the upload and updates the user's profile.

## Database Schema

The database schema is defined in the `prisma/schema.prisma` file. It includes the following models:

-   `User`
-   `Session`
-   `Account`
-   `Verification`
-   `Product`
-   `Order`
-   `OrderItem`
-   `Address`
