# Luxury E-commerce Backend

This is the backend server for the luxury women's clothing e-commerce website. It provides API endpoints for products, orders, user authentication, contact form submissions, and newsletter subscriptions.

## Features

- RESTful API for e-commerce operations
- MongoDB database integration
- User authentication with JWT
- Order processing
- Contact form handling
- Newsletter subscription management
- Product data management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/luxury-ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

## Running the Server

### Development Mode

To run the server in development mode with automatic restart on file changes:

```
npm run dev
```

### Production Mode

To run the server in production mode:

```
npm start
```

The server will start on the port specified in the `.env` file (default: 3000).

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search?query=:query` - Search products

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `GET /api/orders/customer/:email` - Get orders by customer email (protected)
- `PUT /api/orders/status/:orderNumber` - Update order status (admin only)

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Contact

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions (admin only)
- `PUT /api/contact/:id` - Update contact status (admin only)

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter` - Get all subscribers (admin only)

## Notes for Production

For a production environment, consider the following:

1. Use a process manager like PM2 to keep the server running
2. Set up proper error logging with a service like Sentry
3. Implement rate limiting to prevent abuse
4. Use HTTPS for secure communication
5. Set up proper CORS configuration
6. Implement input validation and sanitization
7. Use a production MongoDB instance with proper authentication
8. Set up monitoring and alerting 