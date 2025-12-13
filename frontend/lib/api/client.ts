import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any;
      if (error.response.status === 401) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/sign-in")
        ) {
          window.location.href = "/sign-in";
        }
      }

      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({ error: "No response from server" });
    } else {
      return Promise.reject({ error: error.message });
    }
  },
);

export default api;
