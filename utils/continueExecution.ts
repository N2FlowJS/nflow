import { Flow } from '@components/agent/types/flowTypes';
import { executeNode } from '@utils/executeNode';
import { EXECUTION_STATUS } from '@utils/EXECUTION_STATUS';
import { updateFlowState } from '@utils/updateFlowState';
import { FlowState, ExecutionResult, FlowExecutionContext } from '../types/flowExecutionTypes';

export async function continueExecution(flow: Flow, flowState: FlowState, result: ExecutionResult): Promise<ExecutionResult> {
  // Skip if no next node ID
  if (!result.nextNodeId) {
    return result;
  }

  // Create updated flow state

  // Get the next node
  const nextNode = flow.nodes.find((node) => node.id === result.nextNodeId);
  if (!nextNode) {
    throw new Error(`Next node not found: ${result.nextNodeId}`);
  }

  const context: FlowExecutionContext = {
    flow,
    flowState: flowState,
    input: {
      content: result.execution.output,
      role: result.nodeInfo.role,
    },
  };

  const nextResult = await executeNode(nextNode, context);

  if (!nextResult) {
    return {
      status: EXECUTION_STATUS.ERROR,
      message: `Failed to execute node: ${nextNode.id}`,
      flowState: flowState,
      nodeInfo: {
        id: nextNode.id,
        name: nextNode.data.label || nextNode.id,
        type: nextNode.type || '',
        role: 'developer',
      },
      execution: {
        output: 'Failed to execute next node',
        nodeId: nextNode.id,
        nodeName: nextNode.data.label || nextNode.id,
        startTime: new Date().toISOString(),
      },
    };
  }
   nextResult.flowState = updateFlowState(flowState, result);

  // Stop if waiting for input or completed
  if (nextResult.status === EXECUTION_STATUS.COMPLETED) {
    return nextResult;
  }

  // Otherwise, continue to the next node
  return await continueExecution(flow,  nextResult.flowState, nextResult);
}
