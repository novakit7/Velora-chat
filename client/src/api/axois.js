import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Network error
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest?.url || "";

    // Don't intercept auth endpoints
    if (
      url.includes("/user/login") ||
      url.includes("/user/register") ||
      url.includes("/user/refresh-token") ||
      url.includes("/user/logout")
    ) {
      return Promise.reject(error);
    }

    // Refresh only on 401
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/user/refresh-token");

      processQueue();

      return api(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token failed:", refreshError);

      processQueue(refreshError);

      // Let the app know the session expired
      window.dispatchEvent(new CustomEvent("session-expired"));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;