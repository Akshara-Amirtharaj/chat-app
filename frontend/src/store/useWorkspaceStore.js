import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  channels: [],
  isLoadingWorkspaces: false,
  isLoadingChannels: false,
  isCreatingWorkspace: false,
  isCreatingChannel: false,

  // Fetch all workspaces for the current user
  getWorkspaces: async () => {
    set({ isLoadingWorkspaces: true });
    try {
      const res = await axiosInstance.get("/workspaces/user");
      // Backend returns { workspaces: [...] }
      set({ workspaces: res.data.workspaces || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch workspaces");
      set({ workspaces: [] });
    } finally {
      set({ isLoadingWorkspaces: false });
    }
  },

  // Create a new workspace
  createWorkspace: async (data) => {
    set({ isCreatingWorkspace: true });
    try {
      const res = await axiosInstance.post("/workspaces", data);
      set({ workspaces: [...get().workspaces, res.data] });
      toast.success("Workspace created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create workspace");
      throw error;
    } finally {
      set({ isCreatingWorkspace: false });
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      await axiosInstance.delete(`/workspaces/${workspaceId}`);
      set({ workspaces: get().workspaces.filter(w => w._id !== workspaceId) });
      toast.success("Workspace deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete workspace");
      throw error;
    }
  },

  // Get channels for a specific workspace
  getChannels: async (workspaceId) => {
    set({ isLoadingChannels: true });
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/channels`);
      set({ channels: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch channels");
    } finally {
      set({ isLoadingChannels: false });
    }
  },

  // Create a new channel in a workspace
  createChannel: async (workspaceId, data) => {
    set({ isCreatingChannel: true });
    try {
      const res = await axiosInstance.post(`/workspaces/${workspaceId}/channels`, data);
      set({ channels: [...get().channels, res.data] });
      toast.success("Channel created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create channel");
      throw error;
    } finally {
      set({ isCreatingChannel: false });
    }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  // Remove member from workspace (admin only)
  removeMember: async (workspaceId, memberId) => {
    try {
      await axiosInstance.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      toast.success("Member removed successfully");
      // Refresh workspaces to update member count
      await get().getWorkspaces();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  },

  // Leave workspace
  leaveWorkspace: async (workspaceId) => {
    try {
      await axiosInstance.post(`/workspaces/${workspaceId}/leave`);
      toast.success("Left workspace successfully");
      // Remove from local state
      set({ workspaces: get().workspaces.filter(w => w._id !== workspaceId) });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave workspace");
      throw error;
    }
  },
}));
