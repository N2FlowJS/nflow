import { FlowNode, InterfaceNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { flowStateReducer } from '../flowStateReducer';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';

/**
 * Handler for executing Interface nodes
 * Interface nodes display content and wait for user input
 */
export async function executeInterfaceNode(node: FlowNode, { flow, flowState, input }: FlowExecutionContext, dispatcher?: FlowStateDispatcher): Promise<ExecutionResult> {
  const data = node.data as InterfaceNodeData;
  const startTime = new Date().toISOString();

  // Use shared dispatcher if available, otherwise create local state
  let finalState = flowState;

  if (dispatcher) {
    // For continuing conversation with user input using shared dispatcher
    if (input.role === 'user') {
      dispatcher.updateVariables({ userInput: input });
    }

    // Update node output and current node using shared dispatcher
    dispatcher.setNodeOutput(node.id, input.content || '', 'interface');
    dispatcher.setCurrentNode(node);
    finalState = dispatcher.getState();
  } else {
    // Fallback to local state update
    let updatedState = flowState;

    // For continuing conversation with user input
    // Store the user input in variables using reducer
    if (input.role === 'user') {
      updatedState = flowStateReducer(updatedState, {
        type: 'UPDATE_VARIABLES',
        payload: { userInput: input },
      });
    }

    // Update node output using reducer
    updatedState = flowStateReducer(updatedState, {
      type: 'SET_NODE_OUTPUT',
      payload: { nodeId: node.id, output: input.content || '', nodeType: 'interface' },
    });

    // Update current node using reducer
    updatedState = flowStateReducer(updatedState, {
      type: 'SET_CURRENT_NODE',
      payload: { node },
    });
    
    finalState = updatedState;
  }

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
    flowState: finalState,
  };
}
