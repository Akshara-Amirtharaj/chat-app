import Notification from '../models/notification.model.js';
import { io } from '../lib/socket.js';

// Create notification
export const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    // Emit real-time notification via socket
    io.to(data.userId.toString()).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, cursor, unreadOnly } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('workspaceId', 'name');

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      notifications,
      unreadCount,
      nextCursor: notifications.length > 0 ? notifications[notifications.length - 1]._id : null,
      hasMore: notifications.length === parseInt(limit),
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ userId });

    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error in clearAllNotifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
