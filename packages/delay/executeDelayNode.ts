import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { DelayNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing Delay nodes
 */
export async function executeDelayNode(
  node: FlowNode,
  { flow, flowState, input }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as DelayNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  try {
    // Validate required fields
    if (!form.duration || form.duration <= 0) {
      throw new Error('Invalid delay duration specified');
    }

    // Convert duration to milliseconds
    let delayMs: number;
    switch (form.unit) {
      case 'minutes':
        delayMs = form.duration * 60 * 1000;
        break;
      case 'hours':
        delayMs = form.duration * 60 * 60 * 1000;
        break;
      case 'seconds':
      default:
        delayMs = form.duration * 1000;
        break;
    }

    // Limit maximum delay to 1 hour for safety
    const maxDelayMs = 60 * 60 * 1000; // 1 hour
    if (delayMs > maxDelayMs) {
      throw new Error(`Delay duration too long. Maximum allowed is 1 hour, requested: ${form.duration} ${form.unit}`);
    }

    console.log(`Executing Delay node: ${node.id} for ${form.duration} ${form.unit} (${delayMs}ms)`);

    // Execute the delay
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Pass through the previous output
    const outputText = input.content || 'Delay completed';
    
    console.log(`Delay node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, outputText, 'delay');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = outputText;
      flowState.components[node.id]['type'] = 'delay';
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
        type: 'delay',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: outputText,
      },
    };
  } catch (error: unknown) {
    console.error('Delay execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown delay error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Delay failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'delay',
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
