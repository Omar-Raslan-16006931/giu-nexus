import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const shouldRedirect =
      status === 401 &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/profile/change-password");

    if (shouldRedirect) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;