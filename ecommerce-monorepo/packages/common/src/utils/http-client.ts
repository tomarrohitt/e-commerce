// src/utils/http-client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { CircuitBreaker } from "../services/circuit-breaker-service";
import { HTTP_DEFAULTS } from "../constants";
import { ILogger, LoggerFactory } from "../services/logger-service";

export interface HttpClientConfig {
  baseURL: string;
  serviceName: string;
  timeout?: number;
  headers?: Record<string, string>;
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
    halfOpenRequests?: number;
  };
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, any>;
}

export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly breaker: CircuitBreaker;
  private readonly logger: ILogger;
  private readonly serviceName: string;

  constructor(config: HttpClientConfig) {
    this.serviceName = config.serviceName;
    this.logger = LoggerFactory.create(`HttpClient:${this.serviceName}`);

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? HTTP_DEFAULTS.TIMEOUT,
      headers: config.headers,
      maxRedirects: HTTP_DEFAULTS.MAX_REDIRECTS,
    });

    this.setupInterceptors();

    this.breaker = new CircuitBreaker({
      name: `CircuitBreaker:${this.serviceName}`,
      failureThreshold: config.circuitBreaker?.failureThreshold,
      resetTimeout: config.circuitBreaker?.resetTimeout,
      halfOpenRequests: config.circuitBreaker?.halfOpenRequests,
      onStateChange: (state) => {
        this.logger.info("Circuit breaker state changed", {
          from: state.from,
          to: state.to,
        });
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug("HTTP request", {
          method: config.method?.toUpperCase(),
          url: config.url,
        });
        return config;
      },
      (error) => {
        this.logger.error("Request interceptor error", error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug("HTTP response", {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: AxiosError) => {
        this.logger.error("HTTP error", error, {
          status: error.response?.status,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    });
  }

  async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    });
  }

  async patch<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    });
  }

  // Get full response with headers and status
  async getWithResponse<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.breaker.execute(async () => {
      const response = await this.client.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    });
  }

  // Set default headers
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Remove default header
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  // Get circuit breaker metrics
  getMetrics() {
    return this.breaker.getMetrics();
  }

  // Reset circuit breaker
  resetCircuitBreaker(): void {
    this.breaker.reset();
  }

  // Get underlying axios instance (for advanced use)
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}
