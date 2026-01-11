import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Default: Don't send cookies.
  // You can override this in individual requests if needed.
  withCredentials: false,
});

baseApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

baseApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any;
      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({ error: "No response from server" });
    } else {
      return Promise.reject({ error: error.message });
    }
  },
);
