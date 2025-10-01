import { executeNode } from './executeNode';
import { EXECUTION_STATUS } from '../../../packages/@flow/EXECUTION_STATUS';
import { Flow } from '../../../models/flowTypes';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { MessagePart } from '../../../models/MessagePart';
import { ExecutionResult } from '@n2flowjs/flow/type';

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

  let nextResult: ExecutionResult;
  try {
    nextResult = await executeNode(
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Convert terminal missing-next into a graceful completion
    if (/no next node found in the flow/i.test(msg)) {
      const state = dispatcher ? dispatcher.getState() : prevResult.flowState;
      nextResult = {
        status: EXECUTION_STATUS.ENDED,
        nextNodes: [],
        flowState: state,
        nodeInfo: {
          id: nextNode.id,
          name: nextNode.data?.label || nextNode.id,
          type: nextNode.type as any,
          role: (nextNode.data as any)?.form?.role || 'developer',
        },
        execution: {
          nodeId: nextNode.id,
          nodeName: (nextNode.data as any)?.form?.name || nextNode.id,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          output: state.components?.[nextNode.id]?.output ?? '',
        },
      };
    } else {
      throw err;
    }
  }

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
