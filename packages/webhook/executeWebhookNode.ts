import { WebhookNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes } from '@n2flowjs/flow/find-next-node';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Execute a Webhook node: send an HTTP request with templated URL/payload/headers
 * and optional retry logic.
 */
export async function executeWebhookNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WebhookNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = [
    ...getInputFromTemplate(form.webhookUrl || ''),
    ...getInputFromTemplate(form.payload || ''),
    // extract from headers list/map
    ...(form.headers ? Object.values(form.headers).flatMap(v => getInputFromTemplate(v)) : []),
  ];

  const ready = isNodeReady(inputs, flowState);
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
  const vars: Record<string,string> = {};
  inputs.forEach(key => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    if (!form.webhookUrl) throw new Error('Webhook URL is required');

    const processedUrl = processTemplate(form.webhookUrl, vars);
    const processedPayload = form.payload ? processTemplate(form.payload, vars) : undefined;

    // Normalize headers: accept array of {key,value} or object map
    const rawHeaders: Record<string,string> = {};
    if (Array.isArray((form as any).headers)) {
      (form as any).headers.forEach((h: any) => {
        if (h?.key) rawHeaders[h.key] = h.value ?? '';
      });
    } else if (form.headers) {
      Object.assign(rawHeaders, form.headers);
    }

    const processedHeaders: Record<string,string> = {};
    Object.entries(rawHeaders).forEach(([k,v]) => {
      processedHeaders[k] = processTemplate(v, vars);
    });
    if (!processedHeaders['Content-Type'] && form.method !== 'GET') {
      processedHeaders['Content-Type'] = 'application/json';
    }

    const method = (form.method || 'POST').toUpperCase();

    const maxRetries = Math.min(form.retryCount ?? 0, 10); // safety cap

    const attemptRequest = async (attempt: number): Promise<{ response: Response; data: any; status: number; headers: any; }> => {
      const controller = new AbortController();
      const timeoutMs = 60_000; // fixed 60s timeout
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const init: RequestInit = { method, headers: processedHeaders, signal: controller.signal };
        if (method !== 'GET' && processedPayload) {
          init.body = processedPayload;
        }
        const resp = await fetch(processedUrl, init);
        const ctype = resp.headers.get('content-type');
        let body: any;
        if (ctype && ctype.includes('application/json')) body = await resp.json(); else body = await resp.text();
        clearTimeout(timeoutId);
        return { response: resp, data: body, status: resp.status, headers: Object.fromEntries(resp.headers.entries()) };
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

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, outputText, 'webhook');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = outputText;
      flowState.components[node.id]['type'] = 'webhook';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);
    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'webhook',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output: outputText,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown webhook error';
    return {
      nextNodes: [],
      status: 'error',
      message: `Webhook failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'webhook',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}
