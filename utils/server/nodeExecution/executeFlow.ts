import { continueExecution } from '../../../utils/server/nodeExecution/continueExecution';
import { ExecutionResult, ExecutionStatus, FlowState } from '../../../models/flowExecutionTypes';
import { Flow } from '../../../models/flowTypes';
import { MessagePart } from '../../../models/MessagePart';
import { executeCurrentNode } from './executeCurrentNode';
import { FlowStateDispatcher } from './flowStateDispatcher';

export async function executeFlow(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart,
  callback: (result: ExecutionResult) => void
): Promise<void> {
  try {
    // Create shared dispatcher for entire flow execution
    const dispatcher = new FlowStateDispatcher(flowState);
    
    // Prepare flow state using shared dispatcher
    dispatcher.prepareState();
    
    const result = await executeCurrentNode(flow, dispatcher.getState(), input, callback, dispatcher);
    
    // Update state through shared dispatcher if execution produced output
    if (result.execution.output) {
      dispatcher.addHistory(
        result.nodeInfo.id,
        result.execution.output,
        result.nodeInfo.type
      );
      
      // Update result with new state from dispatcher
      result.flowState = dispatcher.getState();
    }
    
    callback(result);
    const status: ExecutionStatus[] = ['in_progress', 'completed', 'error'];
    if (status.includes(result.status)) {
      await continueExecution(flow, result, callback, dispatcher);
    }
  } catch (error: unknown) {
    throw new Error(`Error in executeFlow: ${error instanceof Error ? error.message : String(error)}`);
  }
}
