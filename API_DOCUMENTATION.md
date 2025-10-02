# Chat App API Documentation

## Authentication & Account Lifecycle

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation Rules:**
- `fullName`: 2-50 characters, letters and spaces only
- `email`: Valid email format
- `password`: Minimum 6 characters, must contain uppercase, lowercase, and number

#### POST /auth/login
Authenticate user and set HttpOnly JWT cookie.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /auth/logout
Clear JWT cookie and logout user.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/check
Get current user information and workspace memberships.

**Headers:** Requires valid JWT cookie

**Response (200):**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "",
  "emailVerified": false,
  "workspaceMemberships": [
    {
      "workspaceId": "workspace_id",
      "role": "member",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Account Management Endpoints

#### DELETE /account?mode=soft|hard
Delete user account with password confirmation.

**Query Parameters:**
- `mode`: "soft" (default) or "hard"

**Request Body:**
```json
{
  "password": "SecurePass123"
}
```

**Soft Delete Response (200):**
```json
{
  "message": "Account deactivated; will be purged in 30 days"
}
```

**Hard Delete Response (200):**
```json
{
  "message": "Account permanently deleted"
}
```

**Features:**
- Soft delete: Marks `deletedAt` field, disables login, scheduled job purges after 30 days
- Hard delete: Immediate purge with cascade ownership transfers
- Password confirmation required for both modes

#### GET /account/export
Export user data as JSON file.

**Headers:** Requires valid JWT cookie

**Response (200):**
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename="account-export.json"`

**Export includes:**
- User profile data
- All messages (sent and received)
- Timestamps and metadata

## Security Features

### Rate Limiting
- **Auth routes**: 5 attempts per 15 minutes per IP
- **Account deletion**: 3 attempts per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### Security Headers
- Helmet.js for security headers
- CORS with credentials support
- HttpOnly JWT cookies
- Content Security Policy

### Password Security
- bcrypt hashing with salt rounds
- Password complexity requirements
- Rate limiting on auth attempts

### Data Protection
- Soft delete with 30-day purge schedule
- Cascade ownership transfers for hard delete
- Data export before deletion
- Email verification placeholder fields

## Error Handling

### Validation Errors (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "message": "Unauthorized - No Token Provided"
}
```

### Rate Limit Errors (429)
```json
{
  "error": "Too many authentication attempts, please try again later.",
  "retryAfter": "15 minutes"
}
```

## Database Models

### User Model
```javascript
{
  email: String (required, unique, lowercase)
  fullName: String (required, trimmed)
  password: String (required, min 6 chars, hashed)
  profilePic: String (default: "")
  emailVerified: Boolean (default: false)
  emailVerificationToken: String (default: null)
  emailVerificationExpires: Date (default: null)
  passwordResetToken: String (default: null)
  passwordResetExpires: Date (default: null)
  deletedAt: Date (default: null, indexed)
  workspaceMemberships: [{
    workspaceId: ObjectId (ref: 'Workspace')
    role: String (enum: ['owner', 'admin', 'member'])
    joinedAt: Date (default: now)
  }]
  createdAt: Date
  updatedAt: Date
}
```

### Message Model
```javascript
{
  senderId: ObjectId (ref: 'User', required)
  receiverId: ObjectId (ref: 'User', required)
  text: String
  image: String
  ownershipTransferred: Boolean (default: false)
  originalSenderId: ObjectId (ref: 'User', default: null)
  transferredAt: Date (default: null)
  createdAt: Date
  updatedAt: Date
}
```

## Scheduled Jobs

### Daily Purge Job
- Runs at 02:00 server time
- Deletes users with `deletedAt` older than 30 days
- Logs errors for monitoring

## Environment Variables

```env
PORT=5000
NODE_ENV=development|production
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173 (production)
MONGODB_URI=your_mongodb_connection_string
```

