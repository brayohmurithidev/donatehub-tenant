// api.ts
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL as string;

// Extend AxiosRequestConfig globally to support _retry
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Create API clients
const API: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

const RefreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Token store
const tokenStore = {
  get access(): string | null {
    return localStorage.getItem("token");
  },
  set access(v: string | null) {
    if (v) localStorage.setItem("token", v);
    else localStorage.removeItem("token");
  },
  get refresh(): string | null {
    return localStorage.getItem("refreshToken");
  },
  set refresh(v: string | null) {
    if (v) localStorage.setItem("refreshToken", v);
    else localStorage.removeItem("refreshToken");
  },
  clearAll(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

let isRefreshing = false;

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

// Attach token before each request
API.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens
API.interceptors.response.use(
    (res) => res,
    async (err: AxiosError): Promise<AxiosResponse | never> => {
      const originalRequest = err.config!;
      const response = err.response;

      if (!response) return Promise.reject(err);

      const status = response.status;
      const isAuthRoute =
          typeof originalRequest.url === "string" &&
          (originalRequest.url.includes("/auth/login") ||
              originalRequest.url.includes("/auth/refresh"));

      if (status === 401 && !originalRequest._retry && !isAuthRoute) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest._retry = true;
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = tokenStore.refresh;
          if (!refreshToken) {
            tokenStore.clearAll();
            return Promise.reject(err);
          }

          const { data } = await RefreshClient.post<{ access_token: string }>(
              "/auth/refresh",
              { refresh_token: refreshToken }
          );

          const newAccessToken = data.access_token;
          if (!newAccessToken) throw new Error("No access_token in refresh response");

          tokenStore.access = newAccessToken;
          API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStore.clearAll();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(err);
    }
);

export default API;