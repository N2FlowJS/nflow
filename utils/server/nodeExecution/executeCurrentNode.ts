import { Flow } from '../../../models/flowTypes';
import { MessagePart } from '../../../models/MessagePart';
import { ExecutionResult, FlowState, FlowStateDispatcher } from '../../../packages/@flow';
import { executeNode } from './executeNode';

export async function executeCurrentNode(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const result = await executeNode(flowState.currentNode, { flow, flowState, input }, callback, dispatcher);
  
  if (result.execution.output && dispatcher) {
    // Use shared dispatcher to update state
    dispatcher.addHistory(
      result.nodeInfo.id,
      result.execution.output,
      result.nodeInfo.type
    );
    
    result.flowState = dispatcher.getState();
  }

  return result;
}
