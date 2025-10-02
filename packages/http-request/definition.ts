/**
 * HTTP Request Node - NEW ARCHITECTURE
 * 
 * Make HTTP/HTTPS requests with template support.
 * Supports all HTTP methods, custom headers, and dynamic variables.
 * 
 * This node handles:
 * - GET, POST, PUT, PATCH, DELETE requests
 * - Dynamic URL and body templates with {variable} syntax
 * - Custom headers with template support
 * - Timeout and redirect handling
 * - JSON and text response parsing
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { HttpRequestForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * HTTP Request Node Definition
 */
export const HttpRequestNodeDefinition: NodeDefinition<HttpRequestForm> = {
  // Metadata
  id: 'http-request',
  name: 'HTTP Request',
  category: NodeCategory.API,
  description: 'Make HTTP/HTTPS requests with dynamic variables and custom headers',
  version: '2.0.0',

  // Visual
  color: '#1890ff',
  tags: ['http', 'api', 'rest', 'fetch', 'request'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'url',
      name: 'URL',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: 'https://api.example.com/data',
      },
    },
    {
      id: 'method',
      name: 'Method',
      type: PortType.TEXT,
      defaultValue: 'GET',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
    },
    {
      id: 'body',
      name: 'Body',
      type: PortType.TEXT,
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 6,
        placeholder: '{"key": "value"} or use {variable}',
      },
    },
    {
      id: 'timeout',
      name: 'Timeout (seconds)',
      type: PortType.NUMBER,
      defaultValue: 30,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 300,
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'response',
      name: 'Response',
      type: PortType.TEXT,
      description: 'Full HTTP response as JSON string',
    },
    {
      id: 'data',
      name: 'Data',
      type: PortType.ANY,
      description: 'Response body data (parsed JSON or text)',
    },
    {
      id: 'status',
      name: 'Status Code',
      type: PortType.NUMBER,
      description: 'HTTP status code (200, 404, etc.)',
    },
    {
      id: 'headers',
      name: 'Response Headers',
      type: PortType.JSON,
      description: 'Response headers as JSON object',
    },
  ],

  // Dynamic Input Ports - Generated from URL and body template variables
  getDynamicInputs: (config: HttpRequestForm) => {
    const variables = new Set<string>();
    
    // Extract from URL
    if (config?.url) {
      getInputFromTemplate(config.url).forEach(v => variables.add(v));
    }
    
    // Extract from body
    if (config?.body) {
      getInputFromTemplate(config.body).forEach(v => variables.add(v));
    }
    
    // Extract from headers
    if (config?.headers) {
      Object.values(config.headers).forEach(headerValue => {
        getInputFromTemplate(headerValue).forEach(v => variables.add(v));
      });
    }
    
    // Create InputPort for each variable
    return Array.from(variables)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.TEXT,
        description: `Template variable from URL/body: {${varName}}`,
        required: false,
        metadata: {
          isDynamic: true,
          sourceTemplate: `{${varName}}`,
        },
      }));
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get config values (prefer inputs over config)
      const url = inputs.url || config.url;
      const method = (inputs.method || config.method || 'GET').toUpperCase();
      const body = inputs.body || config.body;
      const timeout = inputs.timeout || config.timeout || 30;
      const followRedirects = inputs.followRedirects ?? config.followRedirects ?? true;

      // Validate URL
      if (!url || url.trim() === '') {
        throw new Error('URL is required for HTTP request');
      }

      // Extract template variables from URL, body, headers
      const templateVars = new Set<string>();
      getInputFromTemplate(url).forEach(v => templateVars.add(v));
      if (body) {
        getInputFromTemplate(body).forEach(v => templateVars.add(v));
      }
      if (config.headers) {
        Object.values(config.headers).forEach(headerValue => {
          getInputFromTemplate(headerValue).forEach(v => templateVars.add(v));
        });
      }

      // Build variable map from inputs
      const vars: Record<string, string> = {};
      templateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = String(inputs[varName]);
        }
      });

      // Process templates
      const processedUrl = processTemplate(url, vars);
      const processedBody = body ? processTemplate(body, vars) : undefined;

      // Process headers
      const processedHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          processedHeaders[key] = processTemplate(value, vars);
        });
      }

      // Override with input headers if provided
      if (inputs.headers && typeof inputs.headers === 'object') {
        Object.assign(processedHeaders, inputs.headers);
      }

      console.log(`[HTTP Request] ${method} ${processedUrl}`);

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: processedHeaders,
        redirect: followRedirects ? 'follow' : 'manual',
      };

      // Add body for non-GET requests
      if (['POST', 'PUT', 'PATCH'].includes(method) && processedBody) {
        fetchOptions.body = processedBody;
      }

      // Add timeout handling
      const timeoutMs = timeout * 1000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      fetchOptions.signal = controller.signal;

      let response: Response;
      let responseData: any;

      try {
        // Make request
        response = await fetch(processedUrl, fetchOptions);
        clearTimeout(timeoutId);

        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        // Build result object
        const httpResult = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          url: processedUrl,
          method,
        };

        const resultText = JSON.stringify(httpResult, null, 2);

        console.log(`[HTTP Request] ${response.status} ${response.statusText}`);

        // Update state via dispatcher
        if (dispatcher) {
          dispatcher.setNodeOutput(node.id, resultText, 'httprequest');
          dispatcher.setCurrentNode(node);
        }

        return {
          outputs: {
            response: resultText,
            data: responseData,
            status: response.status,
            headers: httpResult.headers,
          },
          status: 'success',
          metadata: {
            startTime,
            endTime: new Date().toISOString(),
            url: processedUrl,
            method,
            statusCode: response.status,
            statusText: response.statusText,
          },
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout} seconds`);
        }
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          response: '',
          data: null,
          status: 0,
          headers: {},
        },
        status: 'error',
        error: `HTTP request failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default HttpRequestNodeDefinition;
