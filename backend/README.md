
# E-commerce Backend

This is the backend for a robust and scalable e-commerce platform. It is built with Node.js, Express, and Prisma, and it provides a comprehensive set of APIs for managing products, categories, users, addresses, carts, and orders.

## Tech Stack

*   **Backend:** Node.js, Express
*   **Database:** PostgreSQL (managed with Prisma)
*   **Authentication:** better-auth
*   **Caching:** Redis
*   **Image Upload:** AWS S3
*   **Validation:** Joi
*   **Logging:** Winston
*   **Other Libraries:**
    *   `helmet`: For securing HTTP headers
    *   `compression`: For compressing HTTP responses
    *   `cors`: For enabling Cross-Origin Resource Sharing
    *   `cookie-parser`: For parsing cookies
    *   `bcryptjs`: For hashing passwords
    *   `nodemailer`: For sending emails

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/e-commerce-backend.git
    cd e-commerce-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables:

    ```
    DATABASE_URL="postgresql://your-user:your-password@your-host:your-port/your-database"
    REDIS_URL="redis://your-redis-host:your-redis-port"
    BETTER_AUTH_URL="your-better-auth-url"
    AWS_ACCESS_KEY_ID="your-aws-access-key-id"
    AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
    AWS_REGION="your-aws-region"
    AWS_S3_BUCKET_NAME="your-aws-s3-bucket-name"
    ```

4.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database (optional):**

    ```bash
    npm run seed:category
    ```

6.  **Start the development server:**

    ```bash
    npm run dev
    ```

The server will be running on `http://localhost:4000`.

## API Endpoints

### Authentication

Authentication is handled by `better-auth`. All API endpoints under `/api/auth` are managed by this service.

### Users

*   **POST /api/users/get-upload-url**
    *   **Description:** Get a presigned URL for uploading a user's profile picture.
    *   **Authentication:** Required
    *   **Response:**
        *   `uploadUrl`: The presigned URL for uploading the image.
        *   `fields`: The fields to include in the multipart/form-data request.

*   **POST /api/users/confirm-upload**
    *   **Description:** Confirm that a user's profile picture has been uploaded.
    *   **Authentication:** Required
    *   **Request Body:**
        *   `key`: The key of the uploaded image in the S3 bucket.
    *   **Response:**
        *   `success`: A boolean indicating whether the upload was successful.
        *   `image`: The key of the uploaded image.

### Products

*   **GET /api/products**
    *   **Description:** Get a list of all products.
    *   **Authentication:** Required
    *   **Query Parameters:**
        *   `page`: The page number to retrieve.
        *   `limit`: The number of products to retrieve per page.
        *   `sortBy`: The field to sort by.
        *   `sortOrder`: The sort order (`asc` or `desc`).
        *   `search`: A search term to filter products by.
        *   `minPrice`: The minimum price to filter by.
        *   `maxPrice`: The maximum price to filter by.
        *   `categoryId`: The ID of the category to filter by.
    *   **Response:** A paginated list of products.

*   **GET /api/products/:id**
    *   **Description:** Get a single product by its ID.
    *   **Authentication:** Required
    *   **Response:** The product object.

*   **POST /api/products**
    *   **Description:** Create a new product.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `name`: The name of the product.
        *   `description`: The description of the product.
        *   `price`: The price of the product.
        *   `stockQuantity`: The stock quantity of the product.
        *   `categoryId`: The ID of the category the product belongs to.
    *   **Response:** The created product object.

*   **PATCH /api/products/:id**
    *   **Description:** Update a product.
    *   **Authentication:** Admin required
    *   **Request Body:** Same as the request body for creating a product.
    *   **Response:** The updated product object.

*   **DELETE /api/products/:id**
    *   **Description:** Delete a product.
    *   **Authentication:** Admin required
    *   **Response:** A success message.

*   **PATCH /api/products/:id/stock**
    *   **Description:** Update the stock quantity of a product.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `stockQuantity`: The new stock quantity.
    *   **Response:** The updated product object.

*   **POST /api/products/:id/get-upload-url**
    *   **Description:** Get presigned URLs for uploading product images.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `imageCount`: The number of images to upload.
    *   **Response:** An array of presigned URLs.

*   **PATCH /api/products/:id/confirm-upload**
    *   **Description:** Confirm that product images have been uploaded.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `images`: An array of image keys.
    *   **Response:** The updated product object.

### Categories

*   **GET /api/category**
    *   **Description:** Get a list of all categories.
    *   **Authentication:** Required
    *   **Response:** A list of category objects.

*   **GET /api/category/:id**
    *   **Description:** Get a single category by its ID.
    *   **Authentication:** Required
    *   **Response:** The category object.

*   **GET /api/category/slug/:slug**
    *   **Description:** Get a single category by its slug.
    *   **Authentication:** Required
    *   **Response:** The category object.

*   **POST /api/category**
    *   **Description:** Create a new category.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `name`: The name of the category.
        *   `slug`: The slug of the category.
    *   **Response:** The created category object.

*   **PATCH /api/category/:id**
    *   **Description:** Update a category.
    *   **Authentication:** Admin required
    *   **Request Body:** Same as the request body for creating a category.
    *   **Response:** The updated category object.

*   **DELETE /api/category/:id**
    *   **Description:** Delete a category.
    *   **Authentication:** Admin required
    *   **Response:** A success message.

### Addresses

*   **GET /api/address**
    *   **Description:** Get a list of all addresses for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** A list of address objects.

*   **GET /api/address/default**
    *   **Description:** Get the default address for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** The default address object.

*   **GET /api/address/:id**
    *   **Description:** Get a single address by its ID.
    *   **Authentication:** Required
    *   **Response:** The address object.

*   **POST /api/address**
    *   **Description:** Create a new address.
    *   **Authentication:** Required
    *   **Request Body:**
        *   `street`: The street address.
        *   `city`: The city.
        *   `state`: The state.
        *   `zipCode`: The zip code.
        *   `country`: The country.
        *   `isDefault`: Whether the address is the default address.
    *   **Response:** The created address object.

*   **PATCH /api/address/:id**
    *   **Description:** Update an address.
    *   **Authentication:** Required
    *   **Request Body:** Same as the request body for creating an address.
    *   **Response:** The updated address object.

*   **DELETE /api/address/:id**
    *   **Description:** Delete an address.
    *   **Authentication:** Required
    *   **Response:** A success message.

*   **PATCH /api/address/:id/default**
    *   **Description:** Set an address as the default address.
    *   **Authentication:** Required
    *   **Response:** A success message.

### Admin Addresses

*   **GET /api/admin/address**
    *   **Description:** Get a list of all addresses.
    *   **Authentication:** Admin required
    *   **Response:** A paginated list of address objects.

*   **GET /api/admin/address/user/:userId**
    *   **Description:** Get a list of all addresses for a specific user.
    *   **Authentication:** Admin required
    *   **Response:** A list of address objects.

*   **PATCH /api/admin/address/user/:userId/set-default/:addressId**
    *   **Description:** Set an address as the default address for a specific user.
    *   **Authentication:** Admin required
    *   **Response:** A success message.

### Cart

*   **GET /api/cart**
    *   **Description:** Get the cart for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** The cart object.

*   **GET /api/cart/count**
    *   **Description:** Get the number of items in the cart for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** The number of items in the cart.

*   **GET /api/cart/validate**
    *   **Description:** Validate the cart for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** A validation object.

*   **POST /api/cart**
    *   **Description:** Add an item to the cart.
    *   **Authentication:** Required
    *   **Request Body:**
        *   `productId`: The ID of the product to add.
        *   `quantity`: The quantity of the product to add.
    *   **Response:** A success message.

*   **PATCH /api/cart/:productId**
    *   **Description:** Update the quantity of an item in the cart.
    *   **Authentication:** Required
    *   **Request Body:**
        *   `quantity`: The new quantity of the product.
    *   **Response:** A success message.

*   **DELETE /api/cart/:productId**
    *   **Description:** Remove an item from the cart.
    *   **Authentication:** Required
    *   **Response:** A success message.

*   **DELETE /api/cart**
    *   **Description:** Clear the cart.
    *   **Authentication:** Required
    *   **Response:** A success message.

### Orders

*   **GET /api/orders**
    *   **Description:** Get a list of all orders for the authenticated user.
    *   **Authentication:** Required
    *   **Query Parameters:**
        *   `page`: The page number to retrieve.
        *   `limit`: The number of orders to retrieve per page.
        *   `status`: The status of the orders to retrieve.
    *   **Response:** A paginated list of order objects.

*   **GET /api/orders/summary**
    *   **Description:** Get a summary of all orders for the authenticated user.
    *   **Authentication:** Required
    *   **Response:** An order summary object.

*   **GET /api/orders/:id**
    *   **Description:** Get a single order by its ID.
    *   **Authentication:** Required
    *   **Response:** The order object.

*   **POST /api/orders**
    *   **Description:** Create a new order from the cart.
    *   **Authentication:** Required
    *   **Request Body:**
        *   `shippingAddressId`: The ID of the shipping address.
    *   **Response:** The created order object.

*   **POST /api/orders/:id/cancel**
    *   **Description:** Cancel an order.
    *   **Authentication:** Required
    *   **Response:** The updated order object.

*   **GET /api/orders/admin/all**
    *   **Description:** Get a list of all orders.
    *   **Authentication:** Admin required
    *   **Query Parameters:**
        *   `page`: The page number to retrieve.
        *   `limit`: The number of orders to retrieve per page.
        *   `status`: The status of the orders to retrieve.
        *   `userId`: The ID of the user to filter by.
        *   `sortBy`: The field to sort by.
        *   `sortOrder`: The sort order (`asc` or `desc`).
    *   **Response:** A paginated list of order objects.

*   **POST /api/orders/:id/status**
    *   **Description:** Update the status of an order.
    *   **Authentication:** Admin required
    *   **Request Body:**
        *   `status`: The new status of the order.
    *   **Response:** The updated order object.

## Error Handling

The API uses a centralized error handler to catch and handle errors. Errors are returned in a consistent format, with a `message` and an optional `error` object.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
