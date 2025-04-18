import { FlowNode, InterfaceNodeData } from '../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../types/flowExecutionTypes';
import { findNextNode } from '@utils/server/findNextNode';

/**
 * Handler for executing Interface nodes
 * Interface nodes display content and wait for user input
 */
export async function executeInterfaceNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState, input } = context;

  // For continuing conversation with user input
  // Store the user input in variables
  if (input.role === 'user') {
    flowState.variables.userInput = input;
  }

  if (!flowState.components[node.id]) flowState.components[node.id] = {};
  flowState.components[node.id]['output'] = input.content || '';
  flowState.components[node.id]['type'] = 'interface';
  const nextNodeId = findNextNode(flow, node.id);
  if (!nextNodeId) {
    throw new Error(`Node ${node.data.label} No next node found in the flow`);
  }

  return {
    status: input.role === 'user' ? 'in_progress' : 'completed',
    nextNodeId,
    nodeInfo: {
      id: node.id,
      name: node.data.label || node.id,
      type: 'interface',
      role: input.role === 'user' ? 'developer' : input.role,
    },
    execution: {
      output: input.content,
      nodeId: node.id,
      nodeName: node.data.label || node.id,
      startTime: new Date().toISOString(),
    },
    flowState: {
      ...flowState,
    },
  };
}
