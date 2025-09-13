import { Flow } from '../../../models/flowTypes';
import { EXECUTION_STATUS } from '../../../utils/server/EXECUTION_STATUS';
import { processNode } from './processNode';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { MessagePart } from '../../../models/MessagePart';
import { ExecutionResult } from '@n2flowjs/flow/type';

export async function continueExecution(
  flow: Flow,
  result: ExecutionResult,
  callback: (result: ExecutionResult) => void,
  history: MessagePart[],
  dispatcher?: FlowStateDispatcher
): Promise<void> {
  // If there are no next nodes, consider this a terminal state and complete gracefully
  if (!result.nextNodes || result.nextNodes.length === 0) {
    // Normalize a final completion event for the current node
    const finalResult: ExecutionResult = {
      status: 'completed',
      nextNodes: [],
      flowState: result.flowState,
      nodeInfo: result.nodeInfo,
      execution: {
        nodeId: result.nodeInfo.id,
        nodeName: result.execution.nodeName,
        startTime: result.execution.startTime,
        endTime: new Date().toISOString(),
        output: result.execution.output,
      },
    };
    callback(finalResult);
    return;
  }

  for (const nodeId of result.nextNodes) {
    const nextResult = await processNode(flow, nodeId, result, callback, history, dispatcher);

    if (nextResult.status !== EXECUTION_STATUS.COMPLETED && nextResult.nextNodes.length > 0) {
      await continueExecution(flow, nextResult, callback, history, dispatcher);
    } else if (!nextResult.nextNodes || nextResult.nextNodes.length === 0) {
      // Terminal state reached after executing this next node
      const finalResult: ExecutionResult = {
        status: 'completed',
        nextNodes: [],
        flowState: nextResult.flowState,
        nodeInfo: nextResult.nodeInfo,
        execution: {
          nodeId: nextResult.nodeInfo.id,
          nodeName: nextResult.execution.nodeName,
          startTime: nextResult.execution.startTime,
          endTime: new Date().toISOString(),
          output: nextResult.execution.output,
        },
      };
      callback(finalResult);
    }
  }
}
