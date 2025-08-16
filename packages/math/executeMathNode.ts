import { MathNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing Math nodes
 */
export async function executeMathNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as MathNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.value1 || ''),
    ...getInputFromTemplate(form.value2 || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for math operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'math',
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
    console.log(`Executing Math node: ${node.id} with operation: ${form.operation}`);

    const value1String = processTemplate(form.value1 || '', vars);
    const value2String = form.value2 ? processTemplate(form.value2, vars) : '';
    
    const value1 = parseFloat(value1String);
    const value2 = value2String ? parseFloat(value2String) : 0;

    if (isNaN(value1)) {
      throw new Error(`Invalid number for value1: ${value1String}`);
    }

    if (form.value2 && isNaN(value2)) {
      throw new Error(`Invalid number for value2: ${value2String}`);
    }

    let result: number;

    switch (form.operation) {
      case 'add':
        result = value1 + value2;
        break;

      case 'subtract':
        result = value1 - value2;
        break;

      case 'multiply':
        result = value1 * value2;
        break;

      case 'divide':
        if (value2 === 0) {
          throw new Error('Division by zero is not allowed');
        }
        result = value1 / value2;
        break;

      case 'power':
        result = Math.pow(value1, value2);
        break;

      case 'sqrt':
        if (value1 < 0) {
          throw new Error('Square root of negative number is not allowed');
        }
        result = Math.sqrt(value1);
        break;

      case 'abs':
        result = Math.abs(value1);
        break;

      case 'round':
        result = Math.round(value1);
        break;

      case 'min':
        result = Math.min(value1, value2);
        break;

      case 'max':
        result = Math.max(value1, value2);
        break;

      default:
        throw new Error(`Unsupported math operation: ${form.operation}`);
    }

    // Apply precision if specified
    const precision = form.precision || 2;
    const formattedResult = parseFloat(result.toFixed(precision));

    const resultText = JSON.stringify({
      operation: form.operation,
      value1: value1,
      value2: form.value2 ? value2 : undefined,
      result: formattedResult,
      precision: precision,
    }, null, 2);
    
    console.log(`Math node completed: ${node.id}` ,resultText);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedResult.toString(), 'math');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = formattedResult.toString();
      flowState.components[node.id]['type'] = 'math';
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
        type: 'math',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedResult.toString(),
      },
    };
  } catch (error: unknown) {
    console.error('Math execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown math error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Math operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'math',
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
