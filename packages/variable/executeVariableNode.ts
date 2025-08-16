import { VariableNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

export async function executeVariableNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as VariableNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = [
    ...getInputFromTemplate(form.variableValue || ''),
    ...getInputFromTemplate(form.defaultValue || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready && form.operation !== 'get') {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for variable operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'variable',
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

  try {
    const vars: Record<string, string> = {};
    inputs.forEach((key) => {
      if (flowState.components[key] !== undefined) {
        vars[key] = flowState.components[key].output || '';
      }
    });

    let result: any;
    const variableName = form.variableName;

    switch (form.operation) {
      case 'set':
        const value = processTemplate(form.variableValue || '', vars);
        flowState.variables[variableName] = value;
        result = { operation: 'set', variable: variableName, value: value };
        break;

      case 'get':
        const currentValue = flowState.variables[variableName];
        if (currentValue === undefined) {
          const defaultValue = form.defaultValue ? processTemplate(form.defaultValue, vars) : null;
          result = { operation: 'get', variable: variableName, value: defaultValue };
        } else {
          result = { operation: 'get', variable: variableName, value: currentValue };
        }
        break;

      case 'delete':
        delete flowState.variables[variableName];
        result = { operation: 'delete', variable: variableName, deleted: true };
        break;

      case 'append':
        const appendValue = processTemplate(form.variableValue || '', vars);
        if (!flowState.variables[variableName]) {
          flowState.variables[variableName] = [];
        }
        if (Array.isArray(flowState.variables[variableName])) {
          flowState.variables[variableName].push(appendValue);
        } else {
          flowState.variables[variableName] = [flowState.variables[variableName], appendValue];
        }
        result = { operation: 'append', variable: variableName, value: flowState.variables[variableName] };
        break;

      default:
        throw new Error(`Unsupported variable operation: ${form.operation}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.updateVariables({ [variableName]: result.value });
      dispatcher.setNodeOutput(node.id, resultText, 'variable');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'variable';
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
        type: 'variable',
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
    console.error('Variable execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown variable error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Variable operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'variable',
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
