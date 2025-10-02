import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Default columns based on task status
const DEFAULT_COLUMNS = [
  { _id: "TODO", name: "To Do", status: "TODO" },
  { _id: "IN_PROGRESS", name: "In Progress", status: "IN_PROGRESS" },
  { _id: "IN_REVIEW", name: "In Review", status: "IN_REVIEW" },
  { _id: "DONE", name: "Done", status: "DONE" },
];

export const useBoardStore = create((set, get) => ({
  columns: DEFAULT_COLUMNS,
  tasks: [],
  isLoadingBoard: false,
  isCreatingTask: false,
  isUpdatingTask: false,

  // Fetch board data (tasks) for a workspace
  getBoardData: async (workspaceId) => {
    set({ isLoadingBoard: true });
    try {
      const res = await axiosInstance.get(`/tasks?workspaceId=${workspaceId}`);
      // Backend returns { tasks: [...] }
      set({ 
        tasks: res.data.tasks || []
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch board");
      set({ tasks: [] });
    } finally {
      set({ isLoadingBoard: false });
    }
  },

  // Create a new task
  createTask: async (data) => {
    set({ isCreatingTask: true });
    try {
      const res = await axiosInstance.post(`/tasks`, data);
      // Backend returns { task: {...} }
      const newTask = res.data.task || res.data;
      set({ tasks: [...get().tasks, newTask] });
      toast.success("Task created");
      return newTask;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
      throw error;
    } finally {
      set({ isCreatingTask: false });
    }
  },

  // Update task (for drag and drop)
  updateTask: async (taskId, updates) => {
    set({ isUpdatingTask: true });
    try {
      const res = await axiosInstance.put(`/tasks/${taskId}`, updates);
      
      // Optimistically update local state
      set({
        tasks: get().tasks.map(task => 
          task._id === taskId ? { ...task, ...updates } : task
        )
      });
      
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
      // Revert on error
      if (updates.workspaceId) {
        get().getBoardData(updates.workspaceId);
      }
      throw error;
    } finally {
      set({ isUpdatingTask: false });
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      set({ tasks: get().tasks.filter(task => task._id !== taskId) });
      toast.success("Task deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  },
}));
