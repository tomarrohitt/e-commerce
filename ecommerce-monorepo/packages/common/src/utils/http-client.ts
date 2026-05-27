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
  headers: Record<string, string>;
}

interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly breaker: CircuitBreaker;
  private readonly logger: ILogger;
  private readonly serviceName: string;

  constructor(config: HttpClientConfig) {
    this.serviceName = config.serviceName;
    this.logger = LoggerFactory.create(`HttpClient:${this.serviceName}`);
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? HTTP_DEFAULTS.TIMEOUT;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };

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

  private mergeHeaders(config?: RequestConfig): Record<string, string> {
    return { ...this.defaultHeaders, ...config?.headers };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const fullURL = `${this.baseURL}${url}`;

    this.logger.debug("HTTP request", {
      method: (options.method ?? "GET").toUpperCase(),
      url,
    });

    try {
      const response = await fetch(fullURL, {
        ...options,
        signal: controller.signal,
      });

      this.logger.debug("HTTP response", { status: response.status, url });
      return response;
    } catch (error) {
      this.logger.error("HTTP error", error, { url });
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : (undefined as T);
    } catch {
      throw new Error(`Failed to parse response body: ${text}`);
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers: this.mergeHeaders(config),
      });
      return this.parseResponse<T>(response);
    });
  }

  async post<T, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: this.mergeHeaders(config),
        body: JSON.stringify(data),
      });
      return this.parseResponse<T>(response);
    });
  }

  async put<T, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "PUT",
        headers: this.mergeHeaders(config),
        body: JSON.stringify(data),
      });
      return this.parseResponse<T>(response);
    });
  }

  async patch<T, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "PATCH",
        headers: this.mergeHeaders(config),
        body: JSON.stringify(data),
      });
      return this.parseResponse<T>(response);
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "DELETE",
        headers: this.mergeHeaders(config),
      });
      return this.parseResponse<T>(response);
    });
  }

  async getWithResponse<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.breaker.execute(async () => {
      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers: this.mergeHeaders(config),
      });
      return {
        data: await this.parseResponse<T>(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    });
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  getMetrics() {
    return this.breaker.getMetrics();
  }

  resetCircuitBreaker(): void {
    this.breaker.reset();
  }
}
