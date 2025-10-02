import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    // Apply theme to document element for DaisyUI
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));