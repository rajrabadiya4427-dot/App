import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  setTheme: (theme, receiverId) => {
    localStorage.setItem("chat-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);

    set({ theme });

     const { authUser, emitThemeChange } = useAuthStore.getState();

  if (authUser && receiverId) {
    emitThemeChange(theme, receiverId); // 🔥 send to friend
  }
  
  },
}));
