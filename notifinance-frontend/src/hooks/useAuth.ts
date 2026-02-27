import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      logout: clearSession,
    }),
    [clearSession, isAuthenticated, user],
  );
}
