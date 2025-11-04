# Subscription API Endpoints Documentation

## Overview
Complete backend API endpoints for subscription management system with authentication, authorization, and comprehensive CRUD operations.

## Base URL
```
/api/subscriptions
```

## Authentication
All endpoints require authentication via JWT token in cookies. Admin/SuperAdmin role required for management endpoints.

## Endpoints Summary

### 1. Main Subscription Management

#### GET /api/subscriptions
**Purpose:** Get all subscriptions with filtering and pagination  
**Auth:** Admin/SuperAdmin required  
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Field to sort by (default: 'createdAt')
- `sortOrder` (string): 'asc' or 'desc' (default: 'desc')
- `status` (string): Filter by status ('active', 'cancelled', etc.)
- `planType` (string): Filter by plan type
- `userId` (string): Filter by user ID
- `planId` (string): Filter by plan ID
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": [...subscriptions],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### POST /api/subscriptions
**Purpose:** Create new subscription  
**Auth:** Admin/SuperAdmin required  
**Body:**
```json
{
  "userId": "string",
  "planId": "string", 
  "billingCycle": "monthly|annual|oneTime",
  "price": number,
  "currency": "string",
  "paymentMethod": "string",
  "startDate": "string",
  "endDate": "string"
}
```

### 2. Individual Subscription Operations

#### GET /api/subscriptions/[id]
**Purpose:** Get subscription by ID  
**Auth:** Admin/SuperAdmin required

#### PUT /api/subscriptions/[id]
**Purpose:** Update subscription  
**Auth:** Admin/SuperAdmin required  
**Body:**
```json
{
  "status": "string",
  "price": number,
  "billingCycle": "string",
  "adminNotes": "string",
  "endDate": "string"
}
```

#### DELETE /api/subscriptions/[id]
**Purpose:** Delete subscription permanently  
**Auth:** Admin/SuperAdmin required

### 3. Subscription Lifecycle Management

#### POST /api/subscriptions/[id]/cancel
**Purpose:** Cancel active subscription  
**Auth:** Admin/SuperAdmin required  
**Body:**
```json
{
  "reason": "string (required)",
  "immediate": boolean,
  "refund": boolean
}
```

#### POST /api/subscriptions/[id]/reactivate
**Purpose:** Reactivate cancelled subscription  
**Auth:** Admin/SuperAdmin required  
**Body:** `{}` (empty)

#### POST /api/subscriptions/[id]/suspend
**Purpose:** Suspend active subscription  
**Auth:** Admin/SuperAdmin required  
**Body:**
```json
{
  "reason": "string (required)"
}
```

#### POST /api/subscriptions/[id]/resume
**Purpose:** Resume suspended subscription  
**Auth:** Admin/SuperAdmin required  
**Body:** `{}` (empty)

### 4. Analytics and Reporting

#### GET /api/subscriptions/analytics
**Purpose:** Get comprehensive subscription analytics  
**Auth:** Admin/SuperAdmin required  
**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActive": number,
      "totalCancelled": number,
      "newSubscriptions": number,
      "revenue": number,
      "churnCount": number
    },
    "breakdown": {
      "byStatus": [{"_id": "active", "count": 10}],
      "byPlanType": [{"_id": "subscription", "count": 8}],
      "byBillingCycle": [{"_id": "monthly", "count": 6}]
    }
  }
}
```

### 5. User-Specific Operations

#### GET /api/subscriptions/user/[userId]
**Purpose:** Get subscriptions for specific user  
**Auth:** Admin/SuperAdmin (or user accessing own data)  
**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status

**Response:** Same structure as main GET endpoint

### 6. Plan-Specific Operations

#### GET /api/subscriptions/plan/[planId]
**Purpose:** Get all subscriptions for specific plan  
**Auth:** Admin/SuperAdmin required  
**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `billingCycle`: Filter by billing cycle

**Response:**
```json
{
  "success": true,
  "data": [...subscriptions],
  "analytics": {
    "total": number,
    "active": number,
    "cancelled": number,
    "revenue": number,
    "billingCycleBreakdown": [...]
  },
  "pagination": {...}
}
```

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "error": "Unauthorized"
}
```
**Status:** 401

### Authorization Errors
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```
**Status:** 403

### Not Found Errors
```json
{
  "success": false,
  "error": "Subscription not found"
}
```
**Status:** 404

### Validation Errors
```json
{
  "success": false,
  "error": "Missing required fields: userId, planId, billingCycle"
}
```
**Status:** 400

### Server Errors
```json
{
  "success": false,
  "error": "Internal server error"
}
```
**Status:** 500

## Status Codes Used
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden / Insufficient permissions
- `404` - Not found
- `500` - Internal server error

## Security Features
- ✅ JWT token authentication via cookies
- ✅ Role-based access control (RBAC)
- ✅ Permission validation per endpoint
- ✅ Token expiration checking
- ✅ Input validation and sanitization
- ✅ Error handling and logging

## Mock Data Features
- ✅ Realistic subscription data
- ✅ Multiple plan types and billing cycles
- ✅ Various subscription statuses
- ✅ User and plan relationship data
- ✅ Analytics calculations
- ✅ Proper date handling

## Integration Notes
- All endpoints work with the SubscriptionService class
- Token management handled by TokenUtils
- Consistent response format across all endpoints
- Proper HTTP status codes
- Comprehensive error handling
- Ready for real database integration

## Future Enhancements
- Database integration (MongoDB/PostgreSQL)
- Payment provider integration (Stripe/PayPal)
- Email notifications
- Webhook support
- Advanced analytics
- Bulk operations
- Export functionality
- Audit logging