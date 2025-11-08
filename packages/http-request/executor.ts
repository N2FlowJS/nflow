import { BaseApiExecutor } from '../@node-plugin/base-api-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { HttpRequestForm } from './types';

/**
 * HTTP Request Executor
 * 
 * Makes HTTP requests to external APIs with customizable methods, headers, and body.
 */
export class HttpRequestExecutor extends BaseApiExecutor<HttpRequestForm> {
  constructor() {
    super({
      nodeType: 'httprequest',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['url', 'body'],
    });
  }

  /**
   * Execute HTTP request logic
   */
  protected async executeLogic(
    form: HttpRequestForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate required fields
    if (!form.url || form.url.trim() === '') {
      throw new Error('No URL specified for HTTP request');
    }

    // Process templates
    const processedUrl = this.processTemplate(form.url, context);
    const processedBody = form.body ? this.processTemplate(form.body, context) : undefined;
    const processedHeaders = this.processHeaders(form.headers, context);

    console.log(`Executing HTTP request: ${form.method} ${processedUrl}`);

    // Prepare fetch options
    const fetchOptions: RequestInit & { timeout?: number } = {
      method: form.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...processedHeaders,
      },
      redirect: form.followRedirects ? 'follow' : 'manual',
      timeout: form.timeout || 30,
    };

    // Add body for non-GET requests
    if (['POST', 'PUT', 'PATCH'].includes(form.method || 'GET') && processedBody) {
      fetchOptions.body = processedBody;
    }

    // Make the request
    const responseData = await this.makeHttpRequest(processedUrl, fetchOptions);

    // Get response details (need to make another request to get headers/status)
    const response = await fetch(processedUrl, fetchOptions);
    
    // Create response object
    const httpResult = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      url: processedUrl,
      method: form.method || 'GET',
    };

    console.log(`HTTP request completed: ${response.status} ${response.statusText}`);

    return JSON.stringify(httpResult, null, 2);
  }
}

// Export singleton instance
export const httpRequestExecutor = new HttpRequestExecutor();
