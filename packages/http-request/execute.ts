import { HttpRequestNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing HTTP Request nodes
 */
export async function executeHttpRequestNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as HttpRequestNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from URL, headers, and body templates
  const inputs: string[] = [
    ...getInputFromTemplate(form.url || ''),
    ...getInputFromTemplate(form.body || ''),
    // Extract from headers if they exist
    ...(form.headers ? Object.values(form.headers).flatMap(header => getInputFromTemplate(header)) : []),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for HTTP request',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'httprequest',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required fields
    if (!form.url || form.url.trim() === '') {
      throw new Error('No URL specified for HTTP request');
    }

    // Process templates with variables
    const processedUrl = processTemplate(form.url, vars);
    const processedBody = form.body ? processTemplate(form.body, vars) : undefined;
    
    // Process headers
    const processedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (form.headers) {
      Object.entries(form.headers).forEach(([key, value]) => {
        processedHeaders[key] = processTemplate(value, vars);
      });
    }

    console.log(`Executing HTTP request: ${form.method} ${processedUrl}`);

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: form.method || 'GET',
      headers: processedHeaders,
      redirect: form.followRedirects ? 'follow' : 'manual',
    };

    // Add body for non-GET requests
    if (['POST', 'PUT', 'PATCH'].includes(form.method || 'GET') && processedBody) {
      fetchOptions.body = processedBody;
    }

    // Add timeout handling
    const timeoutMs = (form.timeout || 30) * 1000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    fetchOptions.signal = controller.signal;

    let response: Response;
    let responseData: any;

    try {
      response = await fetch(processedUrl, fetchOptions);
      clearTimeout(timeoutId);

      // Handle response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Create response object
      const httpResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        url: processedUrl,
        method: form.method || 'GET'
      };

      const resultText = JSON.stringify(httpResult, null, 2);
      
      console.log(`HTTP request completed: ${response.status} ${response.statusText}`);

      // Use shared dispatcher if available
      let finalState = flowState;

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'httprequest');
        dispatcher.setCurrentNode(node);
        finalState = dispatcher.getState();
      } else {
        // Fallback to local state update
        flowState.components[node.id]['output'] = resultText;
        flowState.components[node.id]['type'] = 'httprequest';
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
          type: 'httprequest',
          role: 'developer',
        },
        execution: {
          nodeId: node.id,
          nodeName: node.data?.form?.name || node.id,
          startTime: startTime,
          endTime: new Date().toISOString(),
          output: resultText,
        },
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error(`HTTP request timeout after ${form.timeout || 30} seconds`);
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('HTTP request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown HTTP request error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `HTTP request failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'httprequest',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}
