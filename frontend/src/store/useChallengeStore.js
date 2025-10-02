import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChallengeStore = create((set, get) => ({
  challenges: [],
  currentChallenge: null,
  challengeSummary: null,
  userLogs: [],
  isLoadingChallenges: false,
  isCreatingChallenge: false,
  isLoggingCompletion: false,

  // Get all challenges
  getChallenges: async (workspaceId = null, status = null) => {
    set({ isLoadingChallenges: true });
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (status) params.append('status', status);
      
      const res = await axiosInstance.get(`/challenges?${params.toString()}`);
      set({ challenges: res.data.challenges || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch challenges");
      set({ challenges: [] });
    } finally {
      set({ isLoadingChallenges: false });
    }
  },

  // Get single challenge
  getChallenge: async (challengeId) => {
    try {
      const res = await axiosInstance.get(`/challenges/${challengeId}`);
      set({ currentChallenge: res.data.challenge });
      return res.data.challenge;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch challenge");
      throw error;
    }
  },

  // Create challenge
  createChallenge: async (data) => {
    set({ isCreatingChallenge: true });
    try {
      const res = await axiosInstance.post("/challenges", data);
      set({ challenges: [res.data.challenge, ...get().challenges] });
      toast.success("Challenge created successfully!");
      return res.data.challenge;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create challenge");
      throw error;
    } finally {
      set({ isCreatingChallenge: false });
    }
  },

  // Join challenge
  joinChallenge: async (challengeId) => {
    try {
      const res = await axiosInstance.post(`/challenges/${challengeId}/join`);
      
      // Update challenges list
      set({
        challenges: get().challenges.map(c => 
          c._id === challengeId ? res.data.challenge : c
        ),
        currentChallenge: res.data.challenge,
      });
      
      toast.success("Successfully joined challenge!");
      return res.data.challenge;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join challenge");
      throw error;
    }
  },

  // Leave challenge
  leaveChallenge: async (challengeId) => {
    try {
      await axiosInstance.post(`/challenges/${challengeId}/leave`);
      
      // Remove from challenges list
      set({
        challenges: get().challenges.filter(c => c._id !== challengeId),
        currentChallenge: null,
      });
      
      toast.success("Successfully left challenge");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave challenge");
      throw error;
    }
  },

  // Log completion
  logCompletion: async (challengeId, data) => {
    set({ isLoggingCompletion: true });
    try {
      const res = await axiosInstance.post(`/challenges/${challengeId}/log`, data);
      toast.success(`Logged! 🔥 ${res.data.streak} day streak!`);
      
      // Refresh challenge data
      await get().getChallenge(challengeId);
      await get().getChallengeSummary(challengeId);
      
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log completion");
      throw error;
    } finally {
      set({ isLoggingCompletion: false });
    }
  },

  // Get challenge summary
  getChallengeSummary: async (challengeId) => {
    try {
      const res = await axiosInstance.get(`/challenges/${challengeId}/summary`);
      set({ challengeSummary: res.data.summary });
      return res.data.summary;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch summary");
      throw error;
    }
  },

  // Get user logs
  getUserLogs: async (challengeId) => {
    try {
      const res = await axiosInstance.get(`/challenges/${challengeId}/logs`);
      set({ userLogs: res.data.logs || [] });
      return res.data.logs;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch logs");
      throw error;
    }
  },

  // Clear current challenge
  clearCurrentChallenge: () => {
    set({ currentChallenge: null, challengeSummary: null, userLogs: [] });
  },
}));
