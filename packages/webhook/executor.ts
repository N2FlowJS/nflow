import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { WebhookForm } from './types';

export class WebhookExecutor extends BaseNodeExecutor<WebhookForm> {
  constructor() {
    super({
      nodeType: 'webhook',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['webhookUrl', 'payload'],
    });
  }

  protected async executeLogic(form: WebhookForm, context: ExecutionContext): Promise<string> {
    const { webhookUrl, payload, headers, method, retryCount } = form;

    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    // Process templates
    const processedUrl = this.processTemplate(webhookUrl, context);
    const processedPayload = payload ? this.processTemplate(payload, context) : undefined;

    // Process headers
    const processedHeaders: Record<string, string> = {};
    if (headers) {
      if (Array.isArray(headers)) {
        headers.forEach((h: any) => {
          if (h?.key) {
            processedHeaders[h.key] = this.processTemplate(h.value || '', context);
          }
        });
      } else {
        Object.entries(headers).forEach(([k, v]) => {
          processedHeaders[k] = this.processTemplate(v as string, context);
        });
      }
    }

    // Set default content type if not provided
    if (!processedHeaders['Content-Type'] && method !== 'GET') {
      processedHeaders['Content-Type'] = 'application/json';
    }

    const requestMethod = (method || 'POST').toUpperCase();
    const maxRetries = Math.min(retryCount || 0, 10); // Safety cap

    // Make request with retry logic
    const result = await this.attemptRequest(
      processedUrl,
      requestMethod,
      processedHeaders,
      processedPayload,
      maxRetries
    );

    // Return structured result
    return JSON.stringify({
      url: processedUrl,
      method: requestMethod,
      status: result.status,
      headers: result.headers,
      data: result.data,
      retries: maxRetries,
      metadata: {
        success: result.status >= 200 && result.status < 300,
        contentType: result.headers['content-type'] || 'unknown'
      }
    });
  }

  private async attemptRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    payload: string | undefined,
    maxRetries: number,
    attempt: number = 0
  ): Promise<{ status: number; headers: any; data: any }> {
    const controller = new AbortController();
    const timeoutMs = 60000; // 60s timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };

      if (method !== 'GET' && payload) {
        init.body = payload;
      }

      const response = await fetch(url, init);
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      clearTimeout(timeoutId);

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt < maxRetries) {
        const backoff = 500 * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.attemptRequest(url, method, headers, payload, maxRetries, attempt + 1);
      }

      throw error;
    }
  }
}

export const webhookExecutor = new WebhookExecutor();
