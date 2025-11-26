import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { CircuitBreaker } from "../services/circuit-breaker-service";

export class HttpClient {
  public client: AxiosInstance;
  private breaker: CircuitBreaker;

  constructor(baseURL: string, serviceName: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
    });

    this.breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 10000,
      halfOpenRequests: 1,
      onStateChange: (state) => {
        console.log(`[${serviceName}] Circuit Breaker state: ${state.to}`);
      },
    });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  // Add put, patch, delete as needed...
}
