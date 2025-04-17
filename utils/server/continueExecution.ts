import { Flow } from '@components/agent/types/flowTypes';
import { executeNode } from '@utils/server/executeNode';
import { EXECUTION_STATUS } from '@utils/server/EXECUTION_STATUS';
import { updateFlowState } from '@utils/server/updateFlowState';
import { FlowState, ExecutionResult, FlowExecutionContext } from '../../types/flowExecutionTypes';

type ContinueExecutionOptions = {
  flow: Flow;
  flowState: FlowState;
  result: ExecutionResult;
  callback?: (result: ExecutionResult) => void;
};
export async function continueExecution({ flow, flowState, result, callback }: ContinueExecutionOptions): Promise<ExecutionResult> {
  if (!result.nextNodeId) {
    return result;
  }

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
  callback && callback(nextResult);

  nextResult.flowState = updateFlowState(flowState, result);

  if (nextResult.status === EXECUTION_STATUS.COMPLETED) {
    return nextResult;
  }

  return await continueExecution({ flow, flowState: nextResult.flowState, result: nextResult, callback });
}
