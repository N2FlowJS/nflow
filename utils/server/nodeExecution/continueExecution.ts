import { Flow } from '../../../models/flowTypes';
import { EXECUTION_STATUS } from '../../../utils/server/EXECUTION_STATUS';
import { processNode } from './processNode';
import { FlowStateDispatcher } from '../../../packages/@flow/flow-state-dispatcher';
import { MessagePart } from '../../../models/MessagePart';
import { ExecutionResult } from '../../../packages/@flow/type';

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
