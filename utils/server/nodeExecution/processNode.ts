import { executeNode } from './node/executeNode';
import { EXECUTION_STATUS } from '../EXECUTION_STATUS';
import { Flow } from '../../../models/flowTypes';
import { ExecutionResult } from '../../../models/flowExecutionTypes';
import { FlowStateDispatcher } from './flowStateDispatcher';
import { MessagePart } from '../../../models/MessagePart';

export async function processNode(
  flow: Flow,
  nodeId: string,
  prevResult: ExecutionResult,
  callback: (result: ExecutionResult) => void,
  history: MessagePart[] = [],
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const nextNode = flow.nodes.find((node) => node.id === nodeId);
  if (!nextNode) throw new Error(`Node with ID ${nodeId} not found in the flow`);

  const nextResult = await executeNode(
    nextNode,
    {
      flow,
      flowState: prevResult.flowState,
      input: {
        content: prevResult.execution.output,
        role: prevResult.nodeInfo.role,
      },
      history: history,
    },
    callback,
    dispatcher
  );

  if (nextResult.execution.output && dispatcher) {
    // Use shared dispatcher to update state
    dispatcher.addHistory(nextResult.nodeInfo.id, nextResult.execution.output, nextResult.nodeInfo.type);

    nextResult.flowState = dispatcher.getState();
  }

  callback(nextResult);

  if (nextResult.status === EXECUTION_STATUS.ERROR)
    throw new Error(`Error in node ${nextNode.id}: ${nextResult.message}`);

  return nextResult;
}
