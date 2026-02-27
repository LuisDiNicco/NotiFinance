import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthResponse, AuthTokens } from "@/types/api";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  async function login(email: string, password: string) {
    const response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    setSession(response.data);
    return response.data;
  }

  async function register(email: string, password: string, displayName: string) {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      displayName,
    });
    setSession(response.data);
    return response.data;
  }

  async function startDemo() {
    const response = await apiClient.post<AuthResponse>("/auth/demo");
    setSession(response.data);
    return response.data;
  }

  async function refreshToken() {
    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (!currentRefreshToken) return null;

    const response = await apiClient.post<AuthTokens>("/auth/refresh", {
      refreshToken: currentRefreshToken,
    });

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    setSession({ user: currentUser, tokens: response.data });
    return response.data;
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    startDemo,
    logout: clearSession,
    refreshToken,
  };
}
