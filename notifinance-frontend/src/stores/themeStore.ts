import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      setMode: (mode) => {
        set({ mode });
      },
      toggleMode: () => {
        const mode = get().mode === "dark" ? "light" : "dark";
        set({ mode });
      },
    }),
    {
      name: "notifinance-theme",
    },
  ),
);