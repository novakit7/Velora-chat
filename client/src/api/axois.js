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

    // Don't intercept refresh request itself
    if (originalRequest?.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    // Only refresh on 401
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Wait if refresh is already running
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
      console.error("Refresh failed.");

      processQueue(refreshError);

      // Notify React that the session has expired
      window.dispatchEvent(new CustomEvent("session-expired"));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;