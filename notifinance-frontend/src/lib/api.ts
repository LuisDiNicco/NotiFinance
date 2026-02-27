import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { AuthTokens } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

async function refreshSessionToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await axios.post<AuthTokens>(`${baseURL}/auth/refresh`, {
      refreshToken,
    });

    return response.data;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, clearSession, setSession, user } = useAuthStore.getState();
    if (!refreshToken || !user) {
      clearSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const newTokens = await refreshSessionToken(refreshToken);
    if (!newTokens) {
      clearSession();
      flushQueue(null);
      isRefreshing = false;
      return Promise.reject(error);
    }

    setSession({ user, tokens: newTokens });
    flushQueue(newTokens.accessToken);
    isRefreshing = false;
    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
    return apiClient(originalRequest);
  },
);