import { continueExecution } from '@utils/server/nodeExecution/continueExecution';
import { ExecutionResult, ExecutionStatus, FlowState } from '../../../types/flowExecutionTypes';
import { Flow } from '../../../types/flowTypes';
import { MessagePart } from '../../../types/MessagePart';
import { prepareFlowState } from './prepareFlowState';
import { executeCurrentNode } from './executeCurrentNode';


export async function executeFlow(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart,
  callback: (result: ExecutionResult) => void
): Promise<void> {
  try {
    const preparedState = await prepareFlowState(flowState);
    const result = await executeCurrentNode(flow, preparedState, input, callback);
    callback(result);
    const status: ExecutionStatus[] = ['in_progress', 'completed', 'error'];
    if (status.includes(result.status)) await continueExecution(flow, result, callback);
  } catch (error: unknown) {
    throw new Error(`Error in continueFlow: ${error instanceof Error ? error.message : String(error)}`);
  }
}


