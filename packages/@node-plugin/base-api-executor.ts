import { BaseNodeExecutor, ExecutionContext, ExecutorConfig } from '../@node-plugin/base-executor';

/**
 * Base API Executor
 * 
 * Extends BaseNodeExecutor with HTTP API capabilities.
 * Provides common HTTP request handling, authentication, and response processing.
 */
export abstract class BaseApiExecutor<TForm> extends BaseNodeExecutor<TForm> {
  constructor(config: ExecutorConfig) {
    super(config);
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  protected async makeHttpRequest(
    url: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<any> {
    const timeoutMs = (options.timeout || 30) * 1000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs / 1000} seconds`);
      }
      throw error;
    }
  }

  /**
   * Make authenticated HTTP request
   */
  protected async makeAuthenticatedRequest(
    url: string,
    token: string,
    options: RequestInit & { timeout?: number; authPrefix?: string } = {}
  ): Promise<any> {
    const authPrefix = options.authPrefix || 'Bearer';
    const { authPrefix: _, ...fetchOptions } = options;

    return this.makeHttpRequest(url, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: `${authPrefix} ${token}`,
      },
    });
  }

  /**
   * Make POST request with JSON body
   */
  protected async makeJsonPostRequest(
    url: string,
    body: any,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<any> {
    return this.makeHttpRequest(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Make authenticated POST request with JSON body
   */
  protected async makeAuthenticatedJsonPostRequest(
    url: string,
    token: string,
    body: any,
    options: RequestInit & { timeout?: number; authPrefix?: string } = {}
  ): Promise<any> {
    const authPrefix = options.authPrefix || 'Bearer';
    const { authPrefix: _, ...fetchOptions } = options;

    return this.makeJsonPostRequest(url, body, {
      ...fetchOptions,
      headers: {
        Authorization: `${authPrefix} ${token}`,
        ...fetchOptions.headers,
      },
    });
  }

  /**
   * Process headers with template variables
   */
  protected processHeaders(
    headers: Record<string, string> | undefined,
    context: ExecutionContext
  ): Record<string, string> {
    if (!headers) {
      return {};
    }

    const processedHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      processedHeaders[key] = this.processTemplate(value, context);
    });

    return processedHeaders;
  }
}
