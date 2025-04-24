import { Flow, FlowState, ExecutionResult } from '../../../types';
import { MessagePart } from '../../../types/MessagePart';
import { executeNode } from './node/executeNode';

export async function executeCurrentNode(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart): Promise<ExecutionResult> {
  const result = await executeNode(flowState.currentNode, { flow, flowState, input });
  if (result.execution.output) {
    result.flowState.history.push({
      nodeId: result.nodeInfo.id,
      output: result.execution.output,
      timestamp: new Date().toISOString(),
      nodeType: result.nodeInfo.type,
    });
  }
  return result;
}
