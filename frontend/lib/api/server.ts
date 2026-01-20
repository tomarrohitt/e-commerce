import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    if (cookieHeader) {
      config.headers.Cookie = cookieHeader;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export async function serverApi<T = any>(
  fn: (instance: AxiosInstance) => Promise<T>,
): Promise<T> {
  try {
    const response = await fn(api);
    return response as T;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // This is safe here because it runs outside the Axios internal stack
        redirect("/sign-in");
      }
    }
    // Re-throw other errors so your page can handle 404s or 500s
    throw error;
  }
}

export default api;
