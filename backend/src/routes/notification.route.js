import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.put('/:id/read', protectRoute, markAsRead);
router.put('/read-all', protectRoute, markAllAsRead);
router.delete('/:id', protectRoute, deleteNotification);
router.delete('/', protectRoute, clearAllNotifications);

export default router;
