import { FlowState, ExecutionResult } from '../../types/flowExecutionTypes';

// Update flow state based on execution result

export function updateFlowState(flowState: FlowState, result: ExecutionResult): FlowState {
  // Clone flowState to avoid mutation issues
  const updatedFlowState = { ...flowState };

  // Update with any changes from the result
  if (result.flowState) {
    Object.assign(updatedFlowState, result.flowState);
  }

  // Update current node ID
  updatedFlowState.currentNodeId = result.nextNodeId!;

  // Add output to history if available
  if (result.execution.output && result.nodeInfo.type !== 'interface') {
    updatedFlowState.history.push({
      nodeId: flowState.currentNodeId,
      output: result.execution.output,
      timestamp: new Date().toISOString(),
      nodeType: result.nodeInfo.type,
    });
  }

  return updatedFlowState;
}
