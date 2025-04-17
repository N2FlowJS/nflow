import { executeNode } from '@utils/server/executeNode';
import { continueExecution } from '@utils/server/continueExecution';
import { ExecutionResult, FlowState } from '../../types/flowExecutionTypes';
import { getCurrentNodeId } from './getCurrentNodeId';
import { Flow } from '@components/agent/types/flowTypes';
import { MessagePart } from '../../types/MessagePart';

// Modified handler to handle both new and existing flows
export type ContinueFlowOptions = {
  flow: Flow;
  flowState: FlowState;
  input: MessagePart;
  returnResult?: boolean;
  callback?: (result: ExecutionResult) => void;
};

export async function continueFlow({ flow, flowState, input, callback }: ContinueFlowOptions): Promise<ExecutionResult> {
  try {
    // Start from the last interface node that was reached
    const currentNode = getCurrentNodeId(flow, flowState.currentNodeId);
    const currentNodeId = currentNode.id;
    // Update flow state and add user input to history
    flowState.currentNodeId = currentNodeId;

    // Execute the current node
    const result = await executeNode(currentNode, { flow, flowState, input });
    callback && callback(result);

    return await continueExecution({ flow, flowState, result, callback });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error in continueFlow: ${errorMessage}`);
  }
}
