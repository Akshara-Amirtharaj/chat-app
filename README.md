# CollabWell - Comprehensive Team Collaboration Platform

A full-stack team collaboration platform that combines real-time messaging, workspace management, project tracking, financial management, and team challenges in one unified application.

## 🚀 Features Overview

### 🔐 Authentication & User Management
- **User Registration & Login** - Secure account creation with email validation
- **Account Recovery** - Password reset functionality with secure token-based recovery
- **Profile Management** - Update personal information, profile pictures, and preferences
- **Account Security** - Account deletion with data export capabilities
- **Session Management** - Secure JWT-based authentication with refresh tokens

### 🏢 Workspace Management
- **Create Workspaces** - Set up dedicated spaces for teams and projects
- **Workspace Invitations** - Invite team members via email with role-based access
- **Member Management** - Add, remove, and manage workspace members
- **Role-Based Permissions** - Owner, Admin, Member, and Guest roles with different access levels
- **Workspace Settings** - Customize workspace preferences and configurations

### 💬 Real-Time Communication
- **Channel-Based Messaging** - Organized conversations in dedicated channels
- **Real-Time Chat** - Instant messaging with WebSocket support
- **Message History** - Persistent message storage and retrieval
- **Online Status** - See who's currently online in your workspace
- **Notifications** - Real-time notifications for mentions and important updates

### 📋 Project & Task Management (Board)
- **Kanban Boards** - Visual task management with drag-and-drop functionality
- **Task Creation & Assignment** - Create tasks and assign them to team members
- **Task Status Tracking** - Track progress with customizable status columns
- **Due Dates & Priorities** - Set deadlines and priority levels for tasks
- **Task Comments** - Collaborate on tasks with threaded discussions

### 🎯 Team Challenges
- **Challenge Creation** - Set up team challenges and competitions
- **Progress Tracking** - Monitor individual and team progress
- **Challenge Types** - Support for various challenge formats and goals
- **Automated Reminders** - Scheduled notifications for challenge deadlines
- **Achievement System** - Track and celebrate team accomplishments

### 💰 Financial Management
- **Expense Tracking** - Record and categorize team expenses
- **Bill Splitting** - Automatically split expenses among team members
- **Balance Calculations** - Real-time balance tracking for all members
- **Settlement Management** - Record payments and settle balances
- **Financial Reports** - Export expense data as CSV for accounting
- **Multiple Currencies** - Support for different currency types
- **Smart Settlement Suggestions** - AI-powered recommendations for optimal settlements

### 🔔 Notification System
- **Real-Time Notifications** - Instant alerts for important events
- **Notification Types** - Mentions, task assignments, invites, and more
- **Notification History** - View and manage all notifications
- **Customizable Alerts** - Configure notification preferences

### 📊 Analytics & Insights
- **Workspace Analytics** - Track team activity and engagement
- **Performance Metrics** - Monitor productivity and collaboration stats
- **Usage Reports** - Detailed insights into platform usage

### 🎨 User Experience
- **Modern UI/UX** - Beautiful, responsive design with smooth animations
- **Dark/Light Themes** - Multiple theme options for user preference
- **Mobile Responsive** - Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation** - Easy-to-use interface with clear navigation
- **Real-Time Updates** - Live updates across all features without page refresh

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful UI components
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image and file storage
- **Node Cron** - Scheduled tasks and reminders

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Development server auto-restart
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
chat-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # Utility functions and configurations
│   │   └── constants/      # Application constants
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Custom middleware
│   │   └── lib/            # Utility functions
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm run build
   ```

3. **Environment Setup**
   Create `.env` files in the backend directory with the following variables:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the application**
   
   **Easy Start (Recommended):**
   ```bash
   # PowerShell (Recommended)
   .\start-servers.ps1
   
   # Or double-click start-servers.bat
   start-servers.bat
   ```
   
   **Manual Start:**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```
   
   **Stop Servers:**
   ```bash
   # Double-click stop-servers.bat or run in terminal
   stop-servers.bat
   ```
   
   **Production Mode:**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## 🌟 Key Features in Detail

### Workspace Collaboration
- Create unlimited workspaces for different teams or projects
- Invite members with customizable roles and permissions
- Real-time collaboration across all workspace features
- Centralized dashboard for workspace management

### Advanced Financial Management
- Track shared expenses with automatic splitting algorithms
- Support for equal, percentage-based, and custom splits
- Real-time balance calculations and settlement suggestions
- Comprehensive financial reporting and data export

### Smart Task Management
- Visual Kanban boards with drag-and-drop functionality
- Task assignment with due dates and priority levels
- Progress tracking and status updates
- Integration with notifications and reminders

### Team Challenges & Gamification
- Create custom challenges to boost team engagement
- Track progress with visual indicators
- Automated reminder system for challenge deadlines
- Achievement tracking and celebration features

## 🔒 Security Features

- JWT-based authentication with secure token management
- Password hashing with bcrypt
- CORS protection for cross-origin requests
- Input validation and sanitization
- Secure file upload handling
- Rate limiting (configurable)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1920px and above)
- Laptops and tablets (768px - 1919px)
- Mobile devices (320px - 767px)

## 🎯 Use Cases

- **Startup Teams** - Complete collaboration solution for growing teams
- **Project Management** - Organize tasks, track progress, and manage resources
- **Remote Teams** - Stay connected with real-time communication and collaboration
- **Event Planning** - Coordinate events with expense tracking and task management
- **Study Groups** - Collaborate on projects with integrated communication and planning
- **Small Businesses** - Manage team operations with financial tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@collabwell.com or create an issue in the repository.

## 🚀 Future Enhancements

- Video/Voice calling integration
- Advanced analytics dashboard
- Mobile application (React Native)
- Third-party integrations (Slack, Google Workspace)
- Advanced file sharing and collaboration
- Custom workflow automation
- Multi-language support
- Advanced reporting and insights

---

**CollabWell** - Empowering teams to collaborate, communicate, and succeed together! 🚀
