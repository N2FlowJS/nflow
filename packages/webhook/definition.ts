import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Webhook Node Definition
 * 
 * Send HTTP requests with templated URL, payload, and headers.
 * Supports all HTTP methods, custom headers, retry logic, and template variables.
 * 
 * Configuration:
 * - webhookUrl: HTTP endpoint (supports {variable} templates)
 * - method: HTTP method (GET, POST, PUT, DELETE, PATCH)
 * - payload: Request body (supports {variable} templates)
 * - headers: Custom headers (supports {variable} templates)
 * - retryCount: Number of retry attempts (0-10)
 * 
 * Features:
 * - Template variable support in URL, payload, headers
 * - Automatic JSON/text response handling
 * - Exponential backoff retry
 * - 60-second timeout
 * - Content-Type auto-detection
 * 
 * Dynamic Inputs:
 * - Creates input ports from {variable} templates in URL/payload/headers
 * 
 * Output:
 * - JSON object with url, method, status, headers, data, retries
 * 
 * Example:
 * ```json
 * {
 *   "webhookUrl": "https://api.example.com/users/{userId}",
 *   "method": "POST",
 *   "payload": "{\"name\": \"{userName}\"}",
 *   "headers": {
 *     "Authorization": "Bearer {apiToken}",
 *     "X-Custom": "value"
 *   },
 *   "retryCount": 3
 * }
 * ```
 */
export const WebhookNodeDefinition: NodeDefinition = {
  id: 'webhook',
  name: 'Webhook',
  category: NodeCategory.API,
  description: 'Send HTTP requests with templated URL/payload/headers and retry logic',
  version: '1.0.0',

  inputs: [
    {
      id: 'webhookUrl',
      name: 'Webhook URL',
      type: PortType.TEXT,
      description: 'HTTP endpoint (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'https://api.example.com/webhook' },
    },
    {
      id: 'method',
      name: 'HTTP Method',
      type: PortType.TEXT,
      description: 'Request method',
      required: true,
      defaultValue: 'POST',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
      },
    },
    {
      id: 'payload',
      name: 'Request Body',
      type: PortType.TEXT,
      description: 'JSON payload (supports {variable} templates)',
      required: false,
      defaultValue: '{}',
      metadata: { inputType: 'textarea', rows: 6, placeholder: '{"key": "value"}' },
    },
    {
      id: 'headers',
      name: 'Headers',
      type: PortType.JSON,
      description: 'Custom HTTP headers (supports {variable} templates)',
      required: false,
      defaultValue: {},
      metadata: { inputType: 'textarea', rows: 3, placeholder: '{"Authorization": "Bearer token"}' },
    },
    {
      id: 'retryCount',
      name: 'Retry Count',
      type: PortType.NUMBER,
      description: 'Number of retry attempts on failure (0-10)',
      required: false,
      defaultValue: 0,
      metadata: { inputType: 'number', min: 0, max: 10 },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'output',
      name: 'Response',
      type: PortType.JSON,
      description: 'HTTP response with status, headers, data',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    // Extract from webhookUrl
    if (config.webhookUrl) {
      getInputFromTemplate(config.webhookUrl as string).forEach(v => variableNames.add(v));
    }

    // Extract from payload
    if (config.payload) {
      getInputFromTemplate(config.payload as string).forEach(v => variableNames.add(v));
    }

    // Extract from headers
    if (config.headers) {
      const headers = config.headers as Record<string, string>;
      Object.values(headers).forEach(v => {
        getInputFromTemplate(v).forEach(hv => variableNames.add(hv));
      });
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...WebhookNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<any> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    // Gather required template variables
    const templateVars: string[] = [
      ...getInputFromTemplate(config.webhookUrl as string || ''),
      ...getInputFromTemplate(config.payload as string || ''),
    ];

    if (config.headers) {
      Object.values(config.headers as Record<string, string>).forEach(v => {
        templateVars.push(...getInputFromTemplate(v));
      });
    }

    // Check if all required inputs are ready
    const ready = isNodeReady(templateVars, flowState);
    if (!ready) {
      return {
        nextNodes: [],
        status: 'waiting',
        message: 'Waiting for input variables for webhook request',
        flowState,
        nodeInfo: {
          id: node.id,
          name: node.data?.label || node.id,
          type: 'webhook',
          role: 'developer',
        },
        execution: {
          output: 'Waiting for input variables',
          nodeId: node.id,
          nodeName: node.data?.label || node.id,
          startTime,
        },
      };
    }

    // Gather variable values
    const vars: Record<string, string> = {};
    templateVars.forEach(key => {
      if (inputs[key] !== undefined) {
        vars[key] = String(inputs[key]);
      } else if (flowState.components[key] !== undefined) {
        vars[key] = flowState.components[key].output || '';
      }
    });

    try {
      if (!config.webhookUrl) throw new Error('Webhook URL is required');

      const processedUrl = processTemplate(config.webhookUrl as string, vars);
      const processedPayload = config.payload 
        ? processTemplate(config.payload as string, vars) 
        : undefined;

      // Normalize headers
      const rawHeaders: Record<string, string> = {};
      if (config.headers) {
        Object.assign(rawHeaders, config.headers);
      }

      const processedHeaders: Record<string, string> = {};
      Object.entries(rawHeaders).forEach(([k, v]) => {
        processedHeaders[k] = processTemplate(v, vars);
      });

      const method = (config.method as string || 'POST').toUpperCase();

      if (!processedHeaders['Content-Type'] && method !== 'GET') {
        processedHeaders['Content-Type'] = 'application/json';
      }

      const maxRetries = Math.min((config.retryCount as number) ?? 0, 10);

      const attemptRequest = async (attempt: number): Promise<{ 
        response: Response; 
        data: any; 
        status: number; 
        headers: any; 
      }> => {
        const controller = new AbortController();
        const timeoutMs = 60_000; // 60s timeout
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const init: RequestInit = { 
            method, 
            headers: processedHeaders, 
            signal: controller.signal 
          };

          if (method !== 'GET' && processedPayload) {
            init.body = processedPayload;
          }

          const resp = await fetch(processedUrl, init);
          const ctype = resp.headers.get('content-type');
          let body: any;

          if (ctype && ctype.includes('application/json')) {
            body = await resp.json();
          } else {
            body = await resp.text();
          }

          clearTimeout(timeoutId);

          return { 
            response: resp, 
            data: body, 
            status: resp.status, 
            headers: Object.fromEntries(resp.headers.entries()) 
          };
        } catch (e) {
          clearTimeout(timeoutId);
          if (attempt < maxRetries) {
            const backoff = 500 * Math.pow(2, attempt); // exponential backoff
            await new Promise(r => setTimeout(r, backoff));
            return attemptRequest(attempt + 1);
          }
          throw e;
        }
      };

      const result = await attemptRequest(0);

      const resultPayload = {
        url: processedUrl,
        method,
        status: result.status,
        headers: result.headers,
        data: result.data,
        retries: maxRetries,
      };

      const outputText = JSON.stringify(resultPayload, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, outputText, 'webhook');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          output: outputText
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          url: processedUrl,
          method,
          statusCode: result.status,
          retries: maxRetries
        }
      };
    } catch (error: unknown) {
      console.error('Webhook execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown webhook error';

      return {
        outputs: {
          output: `Error: ${errorMessage}`
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
