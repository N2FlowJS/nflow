import { ValidateNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing Validate nodes
 */
export async function executeValidateNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ValidateNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from input data template
  const inputs: string[] = getInputFromTemplate(form.inputData || '');

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input data to validate',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'validate',
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
    // Process input data template
    const processedInputData = processTemplate(form.inputData || '', vars);

    console.log(`Executing Validate node: ${node.id} with type: ${form.validationType}`);

    // Check required field
    if (form.required && (!processedInputData || processedInputData.trim() === '')) {
      const result = {
        valid: false,
        message: 'Field is required but empty',
        value: processedInputData,
      };
      return createResult(node, flow, flowState, dispatcher, startTime, JSON.stringify(result));
    }

    // Check length constraints
    if (form.minLength !== undefined && processedInputData.length < form.minLength) {
      const result = {
        valid: false,
        message: `Value length (${processedInputData.length}) is less than minimum required (${form.minLength})`,
        value: processedInputData,
      };
      return createResult(node, flow, flowState, dispatcher, startTime, JSON.stringify(result));
    }

    if (form.maxLength !== undefined && processedInputData.length > form.maxLength) {
      const result = {
        valid: false,
        message: `Value length (${processedInputData.length}) exceeds maximum allowed (${form.maxLength})`,
        value: processedInputData,
      };
      return createResult(node, flow, flowState, dispatcher, startTime, JSON.stringify(result));
    }

    // Validate based on type
    let isValid = false;
    let message = '';

    switch (form.validationType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(processedInputData);
        message = isValid ? 'Valid email address' : 'Invalid email format';
        break;

      case 'url':
        try {
          new URL(processedInputData);
          isValid = true;
          message = 'Valid URL';
        } catch {
          isValid = false;
          message = 'Invalid URL format';
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        isValid = phoneRegex.test(processedInputData.replace(/[\s\-\(\)]/g, ''));
        message = isValid ? 'Valid phone number' : 'Invalid phone number format';
        break;

      case 'json':
        try {
          JSON.parse(processedInputData);
          isValid = true;
          message = 'Valid JSON';
        } catch {
          isValid = false;
          message = 'Invalid JSON format';
        }
        break;

      case 'number':
        isValid = !isNaN(parseFloat(processedInputData)) && isFinite(parseFloat(processedInputData));
        message = isValid ? 'Valid number' : 'Invalid number format';
        break;

      case 'date':
        const dateValue = new Date(processedInputData);
        isValid = !isNaN(dateValue.getTime());
        message = isValid ? 'Valid date' : 'Invalid date format';
        break;

      case 'custom':
        if (form.customPattern) {
          try {
            const regex = new RegExp(form.customPattern);
            isValid = regex.test(processedInputData);
            message = isValid ? 'Matches custom pattern' : 'Does not match custom pattern';
          } catch {
            isValid = false;
            message = 'Invalid custom pattern';
          }
        } else {
          isValid = false;
          message = 'No custom pattern specified';
        }
        break;

      default:
        throw new Error(`Unsupported validation type: ${form.validationType}`);
    }

    const result = {
      valid: isValid,
      message: message,
      value: processedInputData,
    };

    console.log(`Validate node completed: ${node.id} = ${isValid}`);

    return createResult(node, flow, flowState, dispatcher, startTime, JSON.stringify(result));
  } catch (error: unknown) {
    console.error('Validate execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Validation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'validate',
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

// Helper function to create result
function createResult(
  node: FlowNode,
  flow: any,
  flowState: any,
  dispatcher: FlowStateDispatcher | undefined,
  startTime: string,
  resultText: string
): ExecutionResult {
  // Use shared dispatcher if available
  let finalState = flowState;

  if (dispatcher) {
    dispatcher.setNodeOutput(node.id, resultText, 'validate');
    dispatcher.setCurrentNode(node);
    finalState = dispatcher.getState();
  } else {
    // Fallback to local state update
    flowState.components[node.id]['output'] = resultText;
    flowState.components[node.id]['type'] = 'validate';
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
      type: 'validate',
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
}
