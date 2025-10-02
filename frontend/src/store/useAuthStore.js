import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'MENTION': return '💬';
    case 'TASK_ASSIGNED': return '📋';
    case 'TASK_DEADLINE': return '⏰';
    case 'INVITE': return '✉️';
    case 'CHALLENGE_REMINDER': return '🎯';
    case 'EXPENSE_ADDED': return '💰';
    case 'SETTLEMENT_REQUEST': return '💵';
    default: return '🔔';
  }
};

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isDeletingAccount: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteAccount: async (password) => {
    set({ isDeletingAccount: true });
    try {
      const response = await axiosInstance.delete("/auth/delete-account", {
        data: { password }
      });
      
      set({ authUser: null });
      get().disconnectSocket();
      
      toast.success("Account deleted successfully");
      // Redirect to login page
      window.location.href = '/login';
      return response.data.success;
    } catch (error) {
      console.error("Error in delete account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      set({ isDeletingAccount: false });
    }
  },

  exportAccountData: async () => {
    try {
      const response = await axiosInstance.get('/account/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'account-export.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Account data exported successfully");
    } catch (error) {
      console.error("Error in export account data:", error);
      toast.error(error.response?.data?.message || "Failed to export account data");
    }
  },

  // Account recovery functions
  requestAccountRecovery: async (email) => {
    try {
      const response = await axiosInstance.post('/account/recovery/request', { email });
      toast.success(response.data.message);
      
      // In development, show the recovery link
      if (response.data.recoveryLink) {
        console.log('Recovery link:', response.data.recoveryLink);
        toast.success(`Recovery link: ${response.data.recoveryLink}`, { duration: 10000 });
      }
      
      return response.data;
    } catch (error) {
      console.error("Error in request account recovery:", error);
      toast.error(error.response?.data?.message || "Failed to request account recovery");
      throw error;
    }
  },

  recoverAccount: async (token) => {
    try {
      const response = await axiosInstance.post('/account/recovery/recover', { token });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      console.error("Error in recover account:", error);
      toast.error(error.response?.data?.message || "Failed to recover account");
      throw error;
    }
  },

  validateRecoveryToken: async (token) => {
    try {
      const response = await axiosInstance.get(`/account/recovery/validate?token=${token}`);
      return response.data;
    } catch (error) {
      console.error("Error in validate recovery token:", error);
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Listen for challenge reminders
    socket.on("challengeReminder", (reminder) => {
      toast(`🎯 ${reminder.challengeTitle}\n\n${reminder.message}`, {
        duration: 8000,
        icon: '🔔',
        style: {
          background: '#4ade80',
          color: '#fff',
        },
      });
    });

    // Listen for notifications
    socket.on("notification", (notification) => {
      const { useNotificationStore } = require('./useNotificationStore');
      useNotificationStore.getState().addNotification(notification);
      
      // Show toast notification
      toast(notification.message, {
        duration: 5000,
        icon: getNotificationIcon(notification.type),
      });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));