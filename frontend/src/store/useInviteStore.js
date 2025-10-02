import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useInviteStore = create((set, get) => ({
  invites: [],
  isLoadingInvites: false,
  isRespondingToInvite: false,

  // Fetch all pending invites
  getInvites: async () => {
    set({ isLoadingInvites: true });
    try {
      const res = await axiosInstance.get("/workspaces/user/invites");
      set({ invites: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch invites");
    } finally {
      set({ isLoadingInvites: false });
    }
  },

  // Accept an invite
  acceptInvite: async (inviteToken, onSuccess) => {
    set({ isRespondingToInvite: true });
    try {
      await axiosInstance.post(`/invites/${inviteToken}/accept`);
      set({ invites: get().invites.filter((inv) => inv.token !== inviteToken) });
      toast.success("Invite accepted!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept invite");
    } finally {
      set({ isRespondingToInvite: false });
    }
  },

  // Decline an invite
  declineInvite: async (inviteToken) => {
    set({ isRespondingToInvite: true });
    try {
      await axiosInstance.post(`/invites/${inviteToken}/decline`);
      set({ invites: get().invites.filter((inv) => inv.token !== inviteToken) });
      toast.success("Invite declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline invite");
    } finally {
      set({ isRespondingToInvite: false });
    }
  },
}));
