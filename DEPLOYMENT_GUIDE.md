# CollabWell Deployment Guide

## 🚀 Render Deployment

### Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas database
4. Cloudinary account

### Environment Variables Required
Set these in your Render dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` (auto-set by Render) |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/collabwell` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-here` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `FRONTEND_URL` | Frontend URL | `https://your-app-name.onrender.com` |

### Deployment Steps

#### Option 1: Using render.yaml (Recommended)
1. **Push the latest code** to your GitHub repository
2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
3. **Configure deployment**:
   - Render will automatically detect the `render.yaml` file
   - Set your environment variables in the dashboard
4. **Deploy**: Render will automatically build and deploy

#### Option 2: Manual Configuration
1. **Create Web Service**:
   - Runtime: `Node`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

2. **Set Environment Variables** (see table above)

3. **Deploy**: Click deploy and wait for build to complete

### Build Process
The deployment will:
1. Install backend dependencies
2. Install frontend dependencies  
3. Build React frontend for production
4. Start the Node.js server
5. Serve React app from Express server

### Post-Deployment
1. **Test the deployment**: Visit your Render URL
2. **Check logs**: Monitor deployment logs for any issues
3. **Verify features**: Test all major features work in production

### Troubleshooting

#### Common Issues:

**Build Failures:**
- Check Node.js version compatibility (requires >=18.0.0)
- Verify all environment variables are set
- Check build logs for specific errors

**Runtime Errors:**
- Verify MongoDB connection string
- Check Cloudinary credentials
- Ensure JWT_SECRET is set and secure

**Frontend Not Loading:**
- Check if build completed successfully
- Verify static file serving configuration
- Check browser console for errors

#### Security Vulnerabilities:
The build shows some npm vulnerabilities. To fix:
```bash
cd frontend
npm audit fix
```

#### Performance Optimization:
- Static files are cached for 1 year
- Gzip compression enabled
- MongoDB connection pooling active

### Monitoring
- **Logs**: Available in Render dashboard
- **Health Check**: Endpoint at `/api/auth/check`
- **Uptime**: Monitor via Render dashboard

### Scaling
- **Free Tier**: Sleeps after 15 minutes of inactivity
- **Paid Tiers**: Always-on with better performance
- **Database**: Consider MongoDB Atlas scaling options

## 🔧 Local Development

### Quick Start
```bash
# Using PowerShell (Recommended)
.\start-servers.ps1

# Or using batch file
start-servers.bat
```

### Manual Start
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Environment Setup
Create `.env` file in backend directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/collabwell
JWT_SECRET=your-development-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📱 Features Available in Production
- ✅ Real-time messaging with WebSocket
- ✅ Workspace management and invitations
- ✅ Financial expense tracking and bill splitting
- ✅ Team challenges and progress tracking
- ✅ Kanban board for task management
- ✅ Notification system
- ✅ Account recovery and security features
- ✅ Responsive design for all devices
- ✅ File upload and image sharing

## 🔒 Security Considerations
- JWT tokens for authentication
- Password hashing with bcrypt
- CORS protection configured
- Environment variables for sensitive data
- Input validation and sanitization
- Secure file upload handling

## 📊 Performance
- React production build optimized
- Static file caching enabled
- Database connection pooling
- Efficient WebSocket connections
- Compressed assets and responses

---

**Need Help?** Check the main README.md or create an issue in the GitHub repository.
