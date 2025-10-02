import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAnalyticsStore = create((set, get) => ({
  workspaceAnalytics: null,
  userAnalytics: null,
  isLoadingWorkspaceAnalytics: false,
  isLoadingUserAnalytics: false,

  // Get workspace analytics
  getWorkspaceAnalytics: async (workspaceId) => {
    set({ isLoadingWorkspaceAnalytics: true });
    try {
      const res = await axiosInstance.get(`/analytics/workspace?workspaceId=${workspaceId}`);
      set({ workspaceAnalytics: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      throw error;
    } finally {
      set({ isLoadingWorkspaceAnalytics: false });
    }
  },

  // Get user analytics
  getUserAnalytics: async () => {
    set({ isLoadingUserAnalytics: true });
    try {
      const res = await axiosInstance.get('/analytics/user');
      set({ userAnalytics: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user analytics');
      throw error;
    } finally {
      set({ isLoadingUserAnalytics: false });
    }
  },

  // Clear analytics
  clearAnalytics: () => {
    set({ workspaceAnalytics: null, userAnalytics: null });
  },
}));
