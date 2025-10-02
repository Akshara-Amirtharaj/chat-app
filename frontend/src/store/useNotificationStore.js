import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  hasMore: false,
  nextCursor: null,

  // Get notifications
  getNotifications: async (unreadOnly = false) => {
    set({ isLoadingNotifications: true });
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (unreadOnly) params.append('unreadOnly', 'true');
      
      const res = await axiosInstance.get(`/notifications?${params.toString()}`);
      set({ 
        notifications: res.data.notifications || [],
        unreadCount: res.data.unreadCount || 0,
        nextCursor: res.data.nextCursor,
        hasMore: res.data.hasMore,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ notifications: [] });
    } finally {
      set({ isLoadingNotifications: false });
    }
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      
      set({
        notifications: get().notifications.map(n => 
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      
      set({
        notifications: get().notifications.map(n => ({ ...n, read: true, readAt: new Date() })),
        unreadCount: 0,
      });
      
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      
      const notification = get().notifications.find(n => n._id === notificationId);
      set({
        notifications: get().notifications.filter(n => n._id !== notificationId),
        unreadCount: notification && !notification.read ? get().unreadCount - 1 : get().unreadCount,
      });
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      await axiosInstance.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  },

  // Add notification (for real-time)
  addNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    });
  },

  // Increment unread count
  incrementUnread: () => {
    set({ unreadCount: get().unreadCount + 1 });
  },
}));
