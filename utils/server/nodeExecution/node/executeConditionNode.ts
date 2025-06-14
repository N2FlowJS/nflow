import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { ConditionNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Condition nodes
 */
export async function executeConditionNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ConditionNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from left and right value templates
  const inputs: string[] = [
    ...getInputFromTemplate(form.leftValue || ''),
    ...getInputFromTemplate(form.rightValue || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input values for condition check',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'condition',
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
    // Validate required fields
    if (!form.leftValue || form.leftValue.trim() === '') {
      throw new Error('No left value specified for condition');
    }
    
    if (!form.rightValue || form.rightValue.trim() === '') {
      throw new Error('No right value specified for condition');
    }

    // Process templates
    const processedLeftValue = processTemplate(form.leftValue, vars);
    const processedRightValue = processTemplate(form.rightValue, vars);

    console.log(`Executing Condition node: ${node.id} comparing "${processedLeftValue}" ${form.operator} "${processedRightValue}"`);

    // Convert values based on data type
    let leftVal: any = processedLeftValue;
    let rightVal: any = processedRightValue;

    switch (form.dataType) {
      case 'number':
        leftVal = parseFloat(processedLeftValue);
        rightVal = parseFloat(processedRightValue);
        if (isNaN(leftVal) || isNaN(rightVal)) {
          throw new Error('Invalid number values for numeric comparison');
        }
        break;
      case 'boolean':
        leftVal = processedLeftValue.toLowerCase() === 'true';
        rightVal = processedRightValue.toLowerCase() === 'true';
        break;
      case 'date':
        leftVal = new Date(processedLeftValue);
        rightVal = new Date(processedRightValue);
        if (isNaN(leftVal.getTime()) || isNaN(rightVal.getTime())) {
          throw new Error('Invalid date values for date comparison');
        }
        break;
      case 'string':
      default:
        // Keep as strings
        break;
    }

    // Perform comparison
    let conditionResult = false;

    switch (form.operator) {
      case 'equals':
        conditionResult = leftVal === rightVal;
        break;
      case 'notEquals':
        conditionResult = leftVal !== rightVal;
        break;
      case 'greaterThan':
        conditionResult = leftVal > rightVal;
        break;
      case 'lessThan':
        conditionResult = leftVal < rightVal;
        break;
      case 'contains':
        conditionResult = String(leftVal).includes(String(rightVal));
        break;
      case 'startsWith':
        conditionResult = String(leftVal).startsWith(String(rightVal));
        break;
      case 'endsWith':
        conditionResult = String(leftVal).endsWith(String(rightVal));
        break;
      case 'regex':
        try {
          const regex = new RegExp(String(rightVal));
          conditionResult = regex.test(String(leftVal));
        } catch (error) {
          throw new Error(`Invalid regex pattern: ${rightVal}`);
        }
        break;
      default:
        throw new Error(`Unsupported operator: ${form.operator}`);
    }

    // Get result based on condition
    const result = conditionResult ? form.trueValue : form.falseValue;
    
    console.log(`Condition node completed: ${node.id} = ${conditionResult} -> "${result}"`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, result, 'condition');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = result;
      flowState.components[node.id]['type'] = 'condition';
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
        type: 'condition',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: result,
      },
    };
  } catch (error: unknown) {
    console.error('Condition execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown condition error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Condition failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'condition',
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
