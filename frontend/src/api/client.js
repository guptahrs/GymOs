import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { showSnackbar } from "../utils/snackbarService";
import { logout } from "../utils/auth";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: show messages for modifying requests and errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      let message = "Something went wrong";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.message) message = data.message;
        else if (data.errors) message = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
        else message = JSON.stringify(data);
      } else if (error.message) {
        message = error.message;
      }

      showSnackbar(message, "error");

      if (error.response?.status === 401) {
        logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } catch (e) {
      // ignore
    }

    return Promise.reject(error);
  }
);

export default API;
