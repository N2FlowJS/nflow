import { FlowNode, InterfaceNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { findNextNodes } from '@utils/server/findNextNode';

/**
 * Handler for executing Interface nodes
 * Interface nodes display content and wait for user input
 */
export async function executeInterfaceNode(node: FlowNode, { flow, flowState, input }: FlowExecutionContext): Promise<ExecutionResult> {
  const data = node.data as InterfaceNodeData;
  const startTime = new Date().toISOString();

  // For continuing conversation with user input
  // Store the user input in variables
  if (input.role === 'user') {
    flowState.variables.userInput = input;
  }

  flowState.components[node.id]['output'] = input.content || '';
  flowState.components[node.id]['type'] = 'interface';
  flowState.components[node.id]['ready'] = true;
  flowState.currentNode = node;

  const nextNodes = findNextNodes(flow, node.id);

  if (nextNodes.length === 0) throw new Error(`Node ${node.data.label} No next node found in the flow`);

  return {
    status: input.role === 'user' ? 'in_progress' : 'completed',
    nextNodes,
    nodeInfo: {
      id: node.id,
      name: data.label || node.id,
      type: 'interface',
      role: input.role === 'user' ? 'developer' : input.role,
    },
    execution: {
      output: input.content,
      nodeId: node.id,
      nodeName: data.form.name || node.id,
      startTime,
      endTime: new Date().toISOString(),
    },
    flowState: {
      ...flowState,
    },
  };
}
