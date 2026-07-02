import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log(error.response.data.message);
    } else if (error.request) {
      console.log("No response from server");
    } else {
      console.log(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;