import { FlowNode } from '@n2flowjs/flow';
import { JsonParseNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing JSON Parse nodes
 */
export async function executeJsonParseNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as JsonParseNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the JSON data template
  const inputs: string[] = [
    ...getInputFromTemplate(form.jsonData || ''),
    ...getInputFromTemplate(form.jsonPath || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input data for JSON processing',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'jsonparse',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input data',
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
    // Process templates
    const processedJsonData = processTemplate(form.jsonData || '{}', vars);
    const processedJsonPath = form.jsonPath ? processTemplate(form.jsonPath, vars) : '';

    console.log(`Executing JSON Parse node: ${node.id} with operation: ${form.operation}`);

    let result: any;

    switch (form.operation) {
      case 'parse':
        try {
          result = JSON.parse(processedJsonData);
        } catch (error) {
          throw new Error(`Invalid JSON data: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
        break;

      case 'stringify':
        try {
          const data = JSON.parse(processedJsonData);
          result = JSON.stringify(data, null, 2);
        } catch (error) {
          // If it's already a string, just return it
          result = processedJsonData;
        }
        break;

      case 'extract':
        if (!processedJsonPath) {
          throw new Error('JSON path is required for extract operation');
        }
        try {
          const data = JSON.parse(processedJsonData);
          result = extractFromPath(data, processedJsonPath);
        } catch (error) {
          throw new Error(`Failed to extract from JSON path: ${error instanceof Error ? error.message : 'Extract error'}`);
        }
        break;

      case 'validate':
        try {
          JSON.parse(processedJsonData);
          result = { valid: true, message: 'Valid JSON' };
        } catch (error) {
          result = { valid: false, message: error instanceof Error ? error.message : 'Invalid JSON' };
        }
        break;

      default:
        throw new Error(`Unsupported JSON operation: ${form.operation}`);
    }

    // Format output based on outputFormat
    let resultText: string;
    if (form.outputFormat === 'string' || typeof result === 'string') {
      resultText = String(result);
    } else {
      resultText = JSON.stringify(result, null, 2);
    }

    console.log(`JSON Parse node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'jsonparse');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'jsonparse';
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
        type: 'jsonparse',
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
  } catch (error: unknown) {
    console.error('JSON Parse execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parse error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `JSON Parse failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'jsonparse',
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

// Helper function to extract data from JSON path
function extractFromPath(data: any, path: string): any {
  const parts = path.split('.');
  let current = data;
  
  for (const part of parts) {
    if (part.includes('[') && part.includes(']')) {
      // Handle array access like "items[0]"
      const [key, indexPart] = part.split('[');
      const index = parseInt(indexPart.replace(']', ''));
      
      if (key) {
        current = current[key];
      }
      
      if (Array.isArray(current) && !isNaN(index)) {
        current = current[index];
      } else {
        throw new Error(`Invalid array access: ${part}`);
      }
    } else {
      // Simple property access
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        throw new Error(`Property not found: ${part}`);
      }
    }
  }
  
  return current;
}
