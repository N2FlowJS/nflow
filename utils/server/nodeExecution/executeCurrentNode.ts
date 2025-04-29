import {  FlowState, ExecutionResult } from '../../../models/flowExecutionTypes';
import { MessagePart } from '../../../models/MessagePart';
import { executeNode } from './node/executeNode';
import { Flow } from '../../../models/flowTypes';

export async function executeCurrentNode(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart,
  callback?: (result: ExecutionResult) => void
): Promise<ExecutionResult> {
  const result = await executeNode(flowState.currentNode, { flow, flowState, input }, callback);
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
