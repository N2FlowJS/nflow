import { Flow } from '../../../models/flowTypes';
import { EXECUTION_STATUS } from '../../../utils/server/EXECUTION_STATUS';
import { ExecutionResult } from '../../../models/flowExecutionTypes';
import { processNode } from './processNode';
import { FlowStateDispatcher } from './flowStateDispatcher';
import { MessagePart } from '../../../models/MessagePart';

export async function continueExecution(
  flow: Flow,
  result: ExecutionResult,
  callback: (result: ExecutionResult) => void,
  history: MessagePart[],
  dispatcher?: FlowStateDispatcher
): Promise<void> {
  if (result.nextNodes.length === 0)
    throw new Error(`No next nodes to continue execution for node ID: ${result.nodeInfo.id}`);

  for (const nodeId of result.nextNodes) {
    const nextResult = await processNode(flow, nodeId, result, callback, history, dispatcher);

    if (nextResult.status !== EXECUTION_STATUS.COMPLETED && nextResult.nextNodes.length > 0) {
      await continueExecution(flow, nextResult, callback, history, dispatcher);
    }
  }
}
