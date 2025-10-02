# CollabWell Backend API

Node.js/Express backend server for the CollabWell team collaboration platform. Provides REST API endpoints, real-time WebSocket communication, and database management.

## 🚀 Features

### Core API Services
- **Authentication API** - JWT-based user authentication and authorization
- **Workspace Management** - CRUD operations for workspaces and member management
- **Real-time Messaging** - WebSocket-powered chat functionality
- **Task Management** - Kanban board and task tracking APIs
- **Financial Management** - Expense tracking, bill splitting, and settlement APIs
- **Challenge System** - Team challenges and progress tracking
- **Notification System** - Real-time notifications and alerts
- **File Upload** - Cloudinary integration for image and file handling

### Technical Features
- **WebSocket Support** - Real-time bidirectional communication
- **Database Integration** - MongoDB with Mongoose ODM
- **Scheduled Tasks** - Automated reminders and cleanup jobs
- **Security Middleware** - CORS, authentication, and input validation
- **Error Handling** - Comprehensive error management and logging

## 🛠 Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Cloud-based image and video management
- **node-cron** - Task scheduling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers and business logic
│   │   ├── auth.controller.js
│   │   ├── workspace.controller.js
│   │   ├── message.controller.js
│   │   ├── finance.controller.js
│   │   └── ...
│   ├── models/             # Database schemas and models
│   │   ├── user.model.js
│   │   ├── workspace.model.js
│   │   ├── message.model.js
│   │   └── ...
│   ├── routes/             # API route definitions
│   │   ├── auth.route.js
│   │   ├── workspace.route.js
│   │   ├── finance.route.js
│   │   └── ...
│   ├── middleware/         # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   ├── lib/               # Utility functions and configurations
│   │   ├── db.js          # Database connection
│   │   ├── socket.js      # WebSocket configuration
│   │   └── cron.js        # Scheduled tasks
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend root directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/collabwell
   JWT_SECRET=your_super_secret_jwt_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Server will be running on**
   - API: http://localhost:5001
   - WebSocket: ws://localhost:5001

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Verify authentication
- `PUT /api/auth/update-profile` - Update user profile

### Workspace Endpoints
- `GET /api/workspaces/user` - Get user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/invites` - Invite users

### Finance Endpoints
- `GET /api/finance/expenses` - Get expenses
- `POST /api/finance/expenses` - Create expense
- `GET /api/finance/summary` - Get financial summary
- `POST /api/finance/settlements` - Record settlement
- `GET /api/finance/settlements/export.csv` - Export CSV

### Real-time Events (WebSocket)
- `connection` - User connects to workspace
- `message` - Send/receive chat messages
- `notification` - Real-time notifications
- `challengeReminder` - Challenge deadline reminders
- `getOnlineUsers` - Online user status updates

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request data validation and sanitization
- **Rate Limiting** - API request rate limiting (configurable)
- **Secure Headers** - Security-focused HTTP headers

## 🗄 Database Models

- **User** - User accounts and profiles
- **Workspace** - Team workspaces and settings
- **Channel** - Communication channels
- **Message** - Chat messages and metadata
- **Task** - Project tasks and assignments
- **Expense** - Financial transactions
- **Settlement** - Payment records
- **Challenge** - Team challenges and progress
- **Notification** - User notifications

## ⚙️ Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend application URL | No |

### Scripts
- `npm run dev` - Start development server with auto-restart
- `npm start` - Start production server
- `npm run lint` - Run ESLint code analysis

## 🔧 Development

### Adding New Features
1. Create model in `src/models/`
2. Add controller logic in `src/controllers/`
3. Define routes in `src/routes/`
4. Update main router in `src/index.js`

### Database Operations
- Models use Mongoose for MongoDB operations
- Automatic connection handling and error management
- Schema validation and middleware support

### WebSocket Integration
- Socket.io handles real-time communication
- User authentication for socket connections
- Event-based message handling

## 📊 Monitoring & Logging

- Console logging for development
- Error tracking and handling
- Database connection monitoring
- WebSocket connection status

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure Cloudinary for production
5. Enable rate limiting and security middleware

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow existing code structure and patterns
2. Add proper error handling and validation
3. Include appropriate middleware for new routes
4. Update this README for new features
5. Test WebSocket functionality thoroughly

## 📄 License

ISC License - See main project README for details.
