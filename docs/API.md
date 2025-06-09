# API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Events](#events)
- [Tickets](#tickets)
- [Contact Requests](#contact-requests)
- [Reviews](#reviews)
- [User Management](#user-management)
- [Data Privacy](#data-privacy)
- [Verification](#verification)
- [Health Check](#health-check)

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All authenticated routes require a valid session cookie. Authentication is handled through Passport.js with support for local and Google OAuth strategies.

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+919876543210",
  "isVerified": false,
  "rating": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

### Get Current User
```http
GET /api/auth/user
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+919876543210",
  "instagram": "@johndoe",
  "isVerified": true,
  "rating": 4.5,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Logout
```http
POST /api/auth/logout
```

## Events

### Get All Events
```http
GET /api/events
```

**Query Parameters:**
- `category` (string): Filter by event category
- `city` (string): Filter by city
- `trending` (boolean): Show only trending events
- `sellingFast` (boolean): Show only events selling fast

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sunburn Festival 2024",
    "description": "India's biggest electronic dance music festival",
    "venue": "Vagator Beach, Goa",
    "date": "2024-12-28T18:00:00.000Z",
    "category": "Music",
    "imageUrl": "https://example.com/image.jpg",
    "city": "Goa",
    "latitude": 15.6014,
    "longitude": 73.7442,
    "trending": true,
    "sellingFast": false,
    "sellerId": 25,
    "price": 5000,
    "originalPrice": 4500,
    "quantity": 2,
    "seatSection": "VIP",
    "verificationCode": "SUN2024VIP001",
    "qrCode": "data:image/png;base64,..."
  }
]
```

### Get Event by ID
```http
GET /api/events/{eventId}
```

### Search Events
```http
GET /api/events/search?q={query}
```

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Filter by category
- `location` (string): Filter by location
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `dateRange` (string): Date range filter (today, tomorrow, this-week, this-month)
- `bounds` (object): Map bounds for location-based search

## Tickets

### Get All Tickets
```http
GET /api/tickets
```

### Get Ticket by ID
```http
GET /api/tickets/{ticketId}
```

### Get Tickets by Event
```http
GET /api/tickets/event/{eventTitle}
```

### Get User's Tickets
```http
GET /api/tickets/user/{userId}
```

### Create Ticket Listing
```http
POST /api/tickets
Content-Type: application/json
Authorization: Required (authenticated user)

{
  "title": "Sunburn Festival 2024",
  "description": "VIP pass with backstage access",
  "venue": "Vagator Beach, Goa",
  "date": "2024-12-28T18:00:00.000Z",
  "category": "Music",
  "price": 5000,
  "originalPrice": 4500,
  "quantity": 2,
  "seatSection": "VIP",
  "city": "Goa",
  "latitude": 15.6014,
  "longitude": 73.7442
}
```

### Update Ticket
```http
PATCH /api/tickets/{ticketId}
Content-Type: application/json
Authorization: Required (ticket owner)

{
  "price": 4800,
  "quantity": 1,
  "status": "available"
}
```

### Delete Ticket
```http
DELETE /api/tickets/{ticketId}
Authorization: Required (ticket owner)
```

### Verify Ticket
```http
POST /api/tickets/{ticketId}/verify
Authorization: Required
```

### Get Ticket Batch Details
```http
GET /api/tickets/batch?eventIds={id1,id2,id3}
```

## Contact Requests

### Create Contact Request
```http
POST /api/contact-requests
Content-Type: application/json
Authorization: Required

{
  "ticketId": 1,
  "sellerId": 25,
  "message": "Hi, I'm interested in purchasing your ticket. Is it still available?"
}
```

### Get User's Contact Requests
```http
GET /api/contact-requests/user/{userId}
Authorization: Required (user must be the requestor)
```

### Get Seller's Contact Requests
```http
GET /api/contact-requests/seller/{sellerId}
Authorization: Required (user must be the seller)
```

### Update Contact Request Status
```http
PATCH /api/contact-requests/{requestId}
Content-Type: application/json
Authorization: Required

{
  "status": "accepted"
}
```

## Reviews

### Create Review
```http
POST /api/reviews
Content-Type: application/json
Authorization: Required

{
  "reviewedUserId": 25,
  "contactRequestId": 1,
  "rating": 5,
  "comment": "Great seller, smooth transaction!"
}
```

### Get User Reviews
```http
GET /api/reviews/user/{userId}
```

### Update Review
```http
PATCH /api/reviews/{reviewId}
Content-Type: application/json
Authorization: Required (review author)

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

### Delete Review
```http
DELETE /api/reviews/{reviewId}
Authorization: Required (review author)
```

## User Management

### Update User Profile
```http
PATCH /api/users/{userId}/profile
Content-Type: application/json
Authorization: Required (user must be the profile owner)

{
  "phone": "+919876543210",
  "instagram": "@newhandle"
}
```

### Get User Profile
```http
GET /api/users/{userId}
```

## Data Privacy

### Export User Data
```http
GET /api/data-privacy/export
Authorization: Required
```

### Delete User Account
```http
DELETE /api/data-privacy/delete
Authorization: Required
```

## Verification

### Verify Ticket Authenticity
```http
GET /api/verification/ticket/{ticketId}
```

**Response:**
```json
{
  "isAuthentic": true,
  "verificationScore": 95,
  "checks": {
    "ticketExists": true,
    "sellerVerified": true,
    "priceReasonable": true,
    "eventActive": true
  },
  "safetyRecommendations": [
    "Meet in a public place",
    "Verify seller identity",
    "Check ticket details carefully"
  ]
}
```

### Verify Seller Authenticity
```http
GET /api/verification/seller/{sellerId}
```

### Get Comprehensive Verification
```http
GET /api/verification/comprehensive/{ticketId}
```

## Health Check

### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "server": "running"
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Search endpoints: 20 requests per minute

## Data Types

### User Object
```typescript
interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  instagram?: string;
  isVerified: boolean;
  rating: number;
  createdAt: string;
}
```

### Ticket Object
```typescript
interface Ticket {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  venue: string;
  date: string;
  category: string;
  imageUrl?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  price: number;
  originalPrice: number;
  quantity: number;
  seatSection?: string;
  status: string;
  verificationCode: string;
  qrCode: string;
  trending: boolean;
  sellingFast: boolean;
  createdAt: string;
}
```

### Contact Request Object
```typescript
interface ContactRequest {
  id: number;
  buyerId: number;
  sellerId: number;
  ticketId: number;
  message: string;
  status: string;
  createdAt: string;
}
```

### Review Object
```typescript
interface UserReview {
  id: number;
  reviewerId: number;
  reviewedUserId: number;
  contactRequestId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}
```