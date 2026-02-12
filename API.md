# 🔌 API Documentation

Complete API reference for FoodFest 2026 Ordering System.

**Base URL (Development):** `http://localhost:3000/api`

---

## 📋 Table of Contents

- [Public APIs](#public-apis)
  - [Get Foods](#get-foods)
  - [Create Order](#create-order)
  - [Submit UTR](#submit-utr)
- [Admin APIs](#admin-apis)
  - [Admin Login](#admin-login)
  - [Get Orders](#get-orders)
  - [Get Statistics](#get-statistics)
  - [Verify Payment](#verify-payment)
  - [Reject Payment](#reject-payment)
  - [Update Order Status](#update-order-status)
  - [Toggle Food Availability](#toggle-food-availability)
  - [Update Stock](#update-stock)

---

## 🌍 Public APIs

### Get Foods

Get list of all food items.

**Endpoint:** `GET /api/foods`

**Authentication:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "Paneer Biryani",
      "price": 120,
      "image": "https://images.unsplash.com/...",
      "isAvailable": true,
      "stock": 50,
      "createdAt": "2026-02-12T10:00:00.000Z",
      "updatedAt": "2026-02-12T10:00:00.000Z"
    }
  ]
}
```

---

### Create Order

Create a new order.

**Endpoint:** `POST /api/orders`

**Authentication:** None

**Request Body:**
```json
{
  "customerName": "John Doe",
  "phone": "9876543210",
  "items": [
    {
      "foodId": "65f1234567890abcdef12345",
      "quantity": 2
    }
  ]
}
```

**Validation:**
- `customerName`: Required, non-empty string
- `phone`: Required, 10-digit number starting with 6-9
- `items`: Required array with at least 1 item
- `foodId`: Must exist in database
- `quantity`: Must be > 0 and <= available stock

**Response Success:**
```json
{
  "success": true,
  "data": {
    "_id": "65f9876543210abcdef98765",
    "orderId": "FF-001",
    "customerName": "John Doe",
    "phone": "9876543210",
    "items": [
      {
        "foodId": "65f1234567890abcdef12345",
        "foodName": "Paneer Biryani",
        "quantity": 2,
        "price": 120
      }
    ],
    "totalAmount": 240,
    "paymentStatus": "pending",
    "orderStatus": "placed",
    "utrNumber": null,
    "createdAt": "2026-02-12T11:00:00.000Z"
  }
}
```

**Response Error (Stock Unavailable):**
```json
{
  "success": false,
  "message": "Insufficient stock for Paneer Biryani. Available: 1"
}
```

**Stock Management:**
- Upon successful order creation, stock is automatically reduced
- If stock becomes 0, `isAvailable` is auto-set to `false`

---

### Submit UTR

Submit UPI Transaction ID for an order.

**Endpoint:** `POST /api/orders/:id/submit-utr`

**Authentication:** None

**URL Parameters:**
- `id`: Order ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "utrNumber": "123456789012"
}
```

**Validation:**
- `utrNumber`: Required, non-empty string
- Duplicate UTR check: Must be unique across all orders

**Response Success:**
```json
{
  "success": true,
  "message": "UTR submitted successfully. Admin will verify your payment shortly.",
  "data": {
    "_id": "65f9876543210abcdef98765",
    "orderId": "FF-001",
    "paymentStatus": "pending_verification",
    "utrNumber": "123456789012",
    ...
  }
}
```

**Response Error (Duplicate UTR):**
```json
{
  "success": false,
  "message": "This UTR number has already been submitted"
}
```

---

## 🔐 Admin APIs

### Admin Login

Authenticate admin user.

**Endpoint:** `POST /api/admin/login`

**Authentication:** None

**Request Body:**
```json
{
  "password": "admin123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "admin-authenticated"
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Usage:**
Store the token in localStorage and include in all subsequent admin API requests:
```javascript
localStorage.setItem('adminToken', data.token);
```

---

### Get Orders

Get all orders (admin only).

**Endpoint:** `GET /api/admin/orders`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f9876543210abcdef98765",
      "orderId": "FF-001",
      "customerName": "John Doe",
      "phone": "9876543210",
      "items": [
        {
          "foodId": "65f1234567890abcdef12345",
          "foodName": "Paneer Biryani",
          "quantity": 2,
          "price": 120
        }
      ],
      "totalAmount": 240,
      "paymentStatus": "pending_verification",
      "orderStatus": "placed",
      "utrNumber": "123456789012",
      "createdAt": "2026-02-12T11:00:00.000Z",
      "updatedAt": "2026-02-12T11:05:00.000Z"
    }
  ]
}
```

**Sorting:** Orders are sorted by `createdAt` in descending order (newest first)

---

### Get Statistics

Get dashboard statistics (admin only).

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "pendingVerification": 5,
    "acceptedOrders": 8,
    "completedOrders": 10,
    "totalRevenue": 3000
  }
}
```

**Revenue Calculation:**
- Only includes orders with `paymentStatus: "paid"`
- Sum of `totalAmount` field

---

### Verify Payment

Verify payment for an order (admin only).

**Endpoint:** `PATCH /api/admin/orders/:id/verify-payment`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**URL Parameters:**
- `id`: Order ID (MongoDB ObjectId)

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "65f9876543210abcdef98765",
    "orderId": "FF-001",
    "paymentStatus": "paid",
    ...
  }
}
```

**Effect:**
- Changes `paymentStatus` from `pending_verification` to `paid`

---

### Reject Payment

Reject payment for an order (admin only).

**Endpoint:** `PATCH /api/admin/orders/:id/reject-payment`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**URL Parameters:**
- `id`: Order ID (MongoDB ObjectId)

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Payment rejected",
  "data": {
    "_id": "65f9876543210abcdef98765",
    "orderId": "FF-001",
    "paymentStatus": "rejected",
    ...
  }
}
```

**Effect:**
- Changes `paymentStatus` to `rejected`

---

### Update Order Status

Update order status (admin only).

**Endpoint:** `PATCH /api/admin/orders/:id/status`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**URL Parameters:**
- `id`: Order ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Valid Status Values:**
- `placed`
- `accepted`
- `completed`

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "65f9876543210abcdef98765",
    "orderId": "FF-001",
    "orderStatus": "accepted",
    ...
  }
}
```

**Typical Flow:**
1. Order created → `placed`
2. Admin accepts → `accepted`
3. Order fulfilled → `completed`

---

### Toggle Food Availability

Toggle food item availability (admin only).

**Endpoint:** `PATCH /api/admin/foods/:id/toggle`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**URL Parameters:**
- `id`: Food ID (MongoDB ObjectId)

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Food item enabled successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "Paneer Biryani",
    "isAvailable": true,
    ...
  }
}
```

**Effect:**
- Toggles `isAvailable` field (true ↔ false)

---

### Update Stock

Update food item stock (admin only).

**Endpoint:** `PATCH /api/admin/foods/:id/stock`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer admin-authenticated
```

**URL Parameters:**
- `id`: Food ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "stock": 30
}
```

**Validation:**
- `stock`: Required, must be >= 0

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "Paneer Biryani",
    "stock": 30,
    "isAvailable": true,
    ...
  }
}
```

**Automatic Behavior:**
- If stock is set to 0, `isAvailable` is automatically set to `false`

---

## 🔒 Authentication

### Admin Routes Protection

All admin routes require authentication:

```javascript
headers: {
  'Authorization': 'Bearer admin-authenticated'
}
```

Get token from login endpoint and include in all requests.

### Error Response (Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Status Code:** 401

---

## ⚠️ Error Responses

All API endpoints follow this error response format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created (new order)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (admin routes)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

---

## 📊 Data Models

### Food Model
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  image: String,
  isAvailable: Boolean,
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderId: String,            // Auto-generated: FF-001, FF-002, etc.
  customerName: String,
  phone: String,
  items: [
    {
      foodId: ObjectId,
      foodName: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentStatus: String,      // pending, pending_verification, paid, rejected
  orderStatus: String,        // placed, accepted, completed
  utrNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing with cURL

### Get Foods
```bash
curl http://localhost:3000/api/foods
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phone": "9876543210",
    "items": [
      {"foodId": "YOUR_FOOD_ID", "quantity": 2}
    ]
  }'
```

### Submit UTR
```bash
curl -X POST http://localhost:3000/api/orders/YOUR_ORDER_ID/submit-utr \
  -H "Content-Type: application/json" \
  -d '{"utrNumber": "123456789012"}'
```

### Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

### Get Orders (Admin)
```bash
curl http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer admin-authenticated"
```

---

## 💡 Tips

1. **Always validate user input** before sending to API
2. **Handle loading states** in UI during API calls
3. **Show appropriate error messages** to users
4. **Use try-catch blocks** for error handling
5. **Store admin token** securely in localStorage
6. **Clear token on logout**

---

## 🔄 Rate Limiting

Currently, there is no rate limiting implemented.

For production, consider adding:
- Rate limiting middleware
- Request throttling
- IP-based restrictions

---

**API Version:** 1.0.0  
**Last Updated:** February 12, 2026
