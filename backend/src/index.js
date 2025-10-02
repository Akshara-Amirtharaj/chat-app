import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// import helmet from "helmet"; // Temporarily commented out until package is installed

import path from "path";

import { connectDB } from "./lib/db.js";
// import { authRateLimit, generalRateLimit, accountDeletionRateLimit } from "./middleware/rateLimiter.middleware.js"; // Temporarily commented out
// import { errorHandler } from "./middleware/validation.middleware.js"; // Temporarily commented out

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import accountRoutes from "./routes/account.route.js";
import workspaceRoutes from "./routes/workspace.route.js";
import channelRoutes from "./routes/channel.route.js";
import taskRoutes from "./routes/task.route.js";
import inviteRoutes from "./routes/invite.route.js";
import challengeRoutes from "./routes/challenge.route.js";
import financeRoutes from "./routes/finance.route.js";
import notificationRoutes from "./routes/notification.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import './lib/cron.js';
import { app, server } from "./lib/socket.js";
import { scheduleChallengeReminders } from "./lib/challengeReminders.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// Security middleware - temporarily commented out until packages are installed
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));

// Rate limiting - temporarily commented out until packages are installed
// app.use(generalRateLimit);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? process.env.FRONTEND_URL 
      : "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Apply routes - rate limiting temporarily disabled until packages are installed
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global error handler (must be last) - temporarily commented out
// app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
  scheduleChallengeReminders();
});