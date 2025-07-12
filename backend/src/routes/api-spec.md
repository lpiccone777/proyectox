# API REST Specification - Depósito Urbano Compartido

## Base URL
```
https://api.depositourbano.com/v1
```

## Authentication
- JWT Bearer Token required for protected routes
- Token included in Authorization header: `Authorization: Bearer <token>`

## Common Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object
  } | null,
  "meta": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  } | null
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register new user
```json
Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+5491112345678",
  "role": "tenant" | "host" | "both"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "tenant"
    },
    "token": "jwt.token.here"
  }
}
```

#### POST /auth/login
Login user
```json
Request:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt.token.here"
  }
}
```

#### POST /auth/google
Google OAuth login
```json
Request:
{
  "idToken": "google.id.token"
}
```

#### POST /auth/apple
Apple OAuth login
```json
Request:
{
  "idToken": "apple.id.token"
}
```

### Users

#### GET /users/profile
Get current user profile (Protected)

#### PUT /users/profile
Update user profile (Protected)
```json
Request:
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+5491112345678",
  "profilePicture": "base64_image_data"
}
```

#### GET /users/:id
Get user public profile

### Spaces

#### GET /spaces
Search and list spaces
```
Query params:
- lat: number (required if using location search)
- lng: number (required if using location search)
- radius: number (km, default: 5)
- type: room|garage|warehouse|locker|other
- minPrice: number
- maxPrice: number
- minSize: number
- city: string
- page: number (default: 1)
- limit: number (default: 20)
```

#### GET /spaces/:id
Get space details

#### POST /spaces (Protected - Host only)
Create new space
```json
Request:
{
  "title": "Garage espacioso en Palermo",
  "description": "Garage seguro con acceso 24hs",
  "type": "garage",
  "address": "Av. Santa Fe 1234",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "postalCode": "1425",
  "latitude": -34.5895,
  "longitude": -58.4103,
  "size": 20,
  "pricePerMonth": 25000,
  "pricePerDay": 1500,
  "features": ["Acceso 24hs", "Seguridad", "Techado"],
  "rules": "No se permiten materiales inflamables",
  "minBookingDays": 7,
  "maxBookingDays": 365
}
```

#### PUT /spaces/:id (Protected - Host only)
Update space

#### DELETE /spaces/:id (Protected - Host only)
Delete space

#### POST /spaces/:id/images (Protected - Host only)
Upload space images
```
Multipart form data:
- images: file[] (max 10 images, max 5MB each)
```

#### DELETE /spaces/:id/images/:imageId (Protected - Host only)
Delete space image

### Bookings

#### GET /bookings (Protected)
Get user bookings
```
Query params:
- role: tenant|host
- status: pending|confirmed|cancelled|completed
- page: number
- limit: number
```

#### GET /bookings/:id (Protected)
Get booking details

#### POST /bookings (Protected - Tenant)
Create booking
```json
Request:
{
  "spaceId": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-03-01",
  "specialInstructions": "Llamar antes de entregar"
}

Response includes payment preference for MercadoPago
```

#### PUT /bookings/:id/status (Protected)
Update booking status
```json
Request:
{
  "status": "confirmed" | "cancelled",
  "cancellationReason": "string (required if cancelling)"
}
```

### Payments

#### POST /payments/webhook
MercadoPago webhook endpoint

#### GET /payments/:bookingId (Protected)
Get payment details for booking

### Reviews

#### GET /spaces/:id/reviews
Get space reviews

#### GET /users/:id/reviews
Get user reviews

#### POST /reviews (Protected)
Create review
```json
Request:
{
  "bookingId": 1,
  "reviewType": "tenant_to_space" | "tenant_to_host" | "host_to_tenant",
  "rating": 5,
  "comment": "Excelente espacio, muy limpio y seguro"
}
```

### Statistics (Protected - Host only)

#### GET /stats/dashboard
Get host dashboard statistics
```json
Response:
{
  "totalSpaces": 5,
  "activeBookings": 3,
  "monthlyRevenue": 125000,
  "occupancyRate": 0.85,
  "averageRating": 4.7
}
```

## Error Codes
- `AUTH_INVALID_CREDENTIALS`: Invalid email or password
- `AUTH_TOKEN_EXPIRED`: JWT token expired
- `AUTH_UNAUTHORIZED`: Unauthorized access
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `BOOKING_CONFLICT`: Space already booked for dates
- `PAYMENT_FAILED`: Payment processing failed
- `SERVER_ERROR`: Internal server error