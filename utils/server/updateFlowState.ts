import { FlowState, ExecutionResult } from '../../types/flowExecutionTypes';

// Update flow state based on execution result
export function updateFlowState(currentState: FlowState, result: ExecutionResult): FlowState {
  // Clone currentState to avoid direct mutation
  const updatedFlowState: FlowState = {
    ...currentState,
    variables: { ...currentState.variables }, // Deep clone variables if necessary
    components: { ...currentState.components }, // Deep clone components if necessary
    history: [...currentState.history], // Clone history array
  };

  // Merge changes from the result's flowState, if it exists
  if (result.flowState) {
    // Explicitly merge properties, giving precedence to result.flowState
    updatedFlowState.currentNodeId = result.flowState.currentNodeId ?? updatedFlowState.currentNodeId;
    updatedFlowState.variables = { ...updatedFlowState.variables, ...(result.flowState.variables || {}) };
    updatedFlowState.components = { ...updatedFlowState.components, ...(result.flowState.components || {}) };
    // Only update history if result.flowState provides a new one (less common)
    // updatedFlowState.history = result.flowState.history || updatedFlowState.history;
    updatedFlowState.completed = result.flowState.completed ?? updatedFlowState.completed; // Merge completed status
  }

  // Update current node ID based on the *next* node to be executed from the result
  // This might seem counter-intuitive, but flowState often reflects the state *before* the next step
  if (result.nextNodeId) {
      updatedFlowState.currentNodeId = result.nextNodeId;
  } else {
      // If there's no next node, the flow might be completed
      updatedFlowState.completed = true;
  }

  // Add output of the *just executed* node (represented by result.nodeInfo) to history
  // Avoid adding history for interface nodes as they usually just wait for input
  if (result.execution.output && result.nodeInfo.type !== 'interface') {
    updatedFlowState.history.push({
      nodeId: result.nodeInfo.id, // Use the ID of the node that produced the output
      output: result.execution.output,
      timestamp: new Date().toISOString(),
      nodeType: result.nodeInfo.type,
   });
  }

  return updatedFlowState;
}
