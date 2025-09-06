import { LogNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

export async function executeLogNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as LogNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.includeData || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for log operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'log',
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

    console.log(`Executing Log node: ${node.id} with level: ${form.logLevel}`);

    const message = processTemplate(form.message || '', vars);
    const includeData = form.includeData ? processTemplate(form.includeData, vars) : null;
    
    // Create log entry
    const logEntry: any = {
      level: form.logLevel || 'info',
      message: message,
      nodeId: node.id,
      nodeName: form.name || node.id,
    };

    // Add timestamp if requested
    if (form.includeTimestamp) {
      logEntry.timestamp = new Date().toISOString();
    }

    // Add node information if requested
    if (form.includeNodeInfo) {
      logEntry.nodeInfo = {
        id: node.id,
        type: node.type,
        name: form.name || node.id,
      };
    }

    // Add additional data if provided
    if (includeData) {
      try {
        logEntry.data = JSON.parse(includeData);
      } catch {
        logEntry.data = includeData;
      }
    }

    // Log to console based on level
    switch (form.logLevel) {
      case 'debug':
        console.debug('[DEBUG]', logEntry);
        break;
      case 'info':
        console.info('[INFO]', logEntry);
        break;
      case 'warn':
        console.warn('[WARN]', logEntry);
        break;
      case 'error':
        console.error('[ERROR]', logEntry);
        break;
      default:
        console.log('[LOG]', logEntry);
        break;
    }

    const resultText = JSON.stringify({
      logged: true,
      level: form.logLevel,
      message: message,
      timestamp: logEntry.timestamp,
    }, null, 2);

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'log');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'log';
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
        type: 'log',
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
    console.error('Log execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown log error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Log operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'log',
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
