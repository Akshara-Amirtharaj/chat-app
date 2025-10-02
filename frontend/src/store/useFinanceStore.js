import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFinanceStore = create((set, get) => ({
  expenses: [],
  summary: null,
  settlements: [],
  isLoadingExpenses: false,
  isCreatingExpense: false,
  isLoadingSummary: false,
  hasMore: false,
  nextCursor: null,

  // Create expense
  createExpense: async (data) => {
    set({ isCreatingExpense: true });
    try {
      const res = await axiosInstance.post("/finance/expenses", data);
      set({ expenses: [res.data.expense, ...get().expenses] });
      toast.success("Expense added successfully!");
      // Refresh summary
      await get().getFinancialSummary(data.workspaceId);
      return res.data.expense;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create expense");
      throw error;
    } finally {
      set({ isCreatingExpense: false });
    }
  },

  // Get expenses
  getExpenses: async (workspaceId, cursor = null) => {
    if (!workspaceId) {
      console.error('No workspaceId provided to getExpenses');
      return;
    }
    
    set({ isLoadingExpenses: true });
    try {
      const params = new URLSearchParams({ workspaceId, limit: 20 });
      if (cursor) params.append('cursor', cursor);
      
      const res = await axiosInstance.get(`/finance/expenses?${params.toString()}`);
      
      if (cursor) {
        set({ 
          expenses: [...get().expenses, ...res.data.expenses],
          nextCursor: res.data.nextCursor,
          hasMore: res.data.hasMore,
        });
      } else {
        set({ 
          expenses: res.data.expenses,
          nextCursor: res.data.nextCursor,
          hasMore: res.data.hasMore,
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error.response?.data);
      // Don't show error toast for access denied - it's expected if not a member
      if (error.response?.status !== 403) {
        toast.error(error.response?.data?.message || "Failed to fetch expenses");
      }
      set({ expenses: [] });
    } finally {
      set({ isLoadingExpenses: false });
    }
  },

  // Get financial summary
  getFinancialSummary: async (workspaceId) => {
    set({ isLoadingSummary: true });
    try {
      const res = await axiosInstance.get(`/finance/summary?workspaceId=${workspaceId}`);
      set({ summary: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch summary");
      throw error;
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  // Record settlement
  recordSettlement: async (data) => {
    try {
      const res = await axiosInstance.post("/finance/settlements", data);
      toast.success("Settlement recorded!");
      // Refresh summary
      await get().getFinancialSummary(data.workspaceId);
      await get().getSettlements(data.workspaceId);
      return res.data.settlement;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record settlement");
      throw error;
    }
  },

  // Get settlements
  getSettlements: async (workspaceId) => {
    try {
      const res = await axiosInstance.get(`/finance/settlements?workspaceId=${workspaceId}`);
      set({ settlements: res.data.settlements || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch settlements");
      set({ settlements: [] });
    }
  },

  // Export CSV
  exportCSV: async (workspaceId) => {
    try {
      const res = await axiosInstance.get(`/finance/settlements/export.csv?workspaceId=${workspaceId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${workspaceId}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Expenses exported!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export");
    }
  },

  // Clear data
  clearFinanceData: () => {
    set({ expenses: [], summary: null, settlements: [], nextCursor: null, hasMore: false });
  },
}));
