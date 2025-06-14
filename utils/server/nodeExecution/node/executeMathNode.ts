import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { MathNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

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

  // Extract variables from value templates
  const inputs: string[] = [
    ...getInputFromTemplate(form.value1 || ''),
    ...getInputFromTemplate(form.value2 || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input values for math operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'math',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input values',
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
    const processedValue1 = processTemplate(form.value1 || '0', vars);
    const processedValue2 = form.value2 ? processTemplate(form.value2, vars) : '';

    console.log(`Executing Math node: ${node.id} with operation: ${form.operation}`);

    // Convert to numbers
    const num1 = parseFloat(processedValue1);
    const num2 = processedValue2 ? parseFloat(processedValue2) : 0;

    if (isNaN(num1)) {
      throw new Error(`Invalid number for value1: ${processedValue1}`);
    }

    if (form.value2 && isNaN(num2)) {
      throw new Error(`Invalid number for value2: ${processedValue2}`);
    }

    let result: number;

    switch (form.operation) {
      case 'add':
        result = num1 + num2;
        break;
      case 'subtract':
        result = num1 - num2;
        break;
      case 'multiply':
        result = num1 * num2;
        break;
      case 'divide':
        if (num2 === 0) {
          throw new Error('Division by zero');
        }
        result = num1 / num2;
        break;
      case 'power':
        result = Math.pow(num1, num2);
        break;
      case 'sqrt':
        if (num1 < 0) {
          throw new Error('Cannot calculate square root of negative number');
        }
        result = Math.sqrt(num1);
        break;
      case 'abs':
        result = Math.abs(num1);
        break;
      case 'round':
        result = Math.round(num1);
        break;
      case 'min':
        result = Math.min(num1, num2);
        break;
      case 'max':
        result = Math.max(num1, num2);
        break;
      default:
        throw new Error(`Unsupported math operation: ${form.operation}`);
    }

    // Apply precision if specified
    const precision = form.precision ?? 2;
    const formattedResult = Number(result.toFixed(precision));
    const resultText = String(formattedResult);

    console.log(`Math node completed: ${node.id} = ${resultText}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'math');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
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
        output: resultText,
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
