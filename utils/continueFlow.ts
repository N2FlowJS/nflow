import { addUserInputToHistory } from '@utils/addUserInputToHistory';
import { executeNode } from '@utils/executeNode';
import { continueExecution } from '@utils/continueExecution';
import { ExecutionResult } from '../types/flowExecutionTypes';
import { continueFlowOptions } from './continueFlowOptions';
import { getCurrentNodeId } from './getCurrentNodeId';

export async function continueFlow({ flow, flowState, input }: continueFlowOptions): Promise<ExecutionResult> {
  try {
    // Start from the last interface node that was reached
    const currentNode = getCurrentNodeId(flow, flowState.currentNodeId);
    if (!currentNode) throw new Error(`Node not found`);
    const currentNodeId = currentNode.id;

    // Update flow state and add user input to history
    flowState.currentNodeId = currentNodeId;

    if (input?.content && input.role === 'user') {
      addUserInputToHistory(flowState, input?.content);
    }

    // Execute the current node
    const result = await executeNode(currentNode, {
      flow,
      flowState,
      input,
    });
    console.log('Node execution result:', result);

    if (!result) {
      throw new Error(`Failed to execute node: ${currentNodeId}`);
    }

    return await continueExecution(flow, flowState, result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error in continueFlow: ${errorMessage}`);
  }
}
