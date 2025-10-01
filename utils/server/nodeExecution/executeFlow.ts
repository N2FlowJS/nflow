import { continueExecution } from '../../../utils/server/nodeExecution/continueExecution';
import { ExecutionResult, ExecutionStatus, FlowState } from '../../../models/flowExecutionTypes';
import { Flow } from '../../../models/flowTypes';
import { MessagePart } from '../../../models/MessagePart';
import { executeCurrentNode } from './executeCurrentNode';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

export async function executeFlow(
  flow: Flow,
  flowState: FlowState,
  input: MessagePart,
  history: MessagePart[],
  callback: (result: ExecutionResult) => void
): Promise<void> {
  // Helper to finalize execution cleanly
  const finalize = (finalState: FlowState): ExecutionResult => {
    const node = finalState.currentNode;
    const comp = finalState.components?.[node?.id] as any;
    const output = comp?.output ?? '';
    const exec: ExecutionResult = {
      status: 'ended',
      nextNodes: [],
      flowState: finalState,
      nodeInfo: {
        id: node?.id,
        name: node?.data?.label || node?.id || 'unknown',
        type: node?.type || 'unknown',
        role: node?.data?.form?.role || 'developer',
      },
      execution: {
        nodeId: node?.id,
        nodeName: node?.data?.form?.name || node?.id || 'unknown',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        output: output,
      },
    };
    return exec;
  };

  try {
    // Create shared dispatcher for entire flow execution
    const dispatcher = new FlowStateDispatcher(flowState);

    // Prepare flow state using shared dispatcher
    dispatcher.prepareState();

    // Execute the current node (should be the Begin node for a new conversation)
    const result = await executeCurrentNode(flow, dispatcher.getState(), input, callback, dispatcher);

    // Update state through shared dispatcher if execution produced output
    if (result.execution.output) {
      dispatcher.addHistory(result.nodeInfo.id, result.execution.output, result.nodeInfo.type);
      // Update result with new state from dispatcher
      result.flowState = dispatcher.getState();
    }

    // If there are no next nodes, treat this as graceful completion
    if (!result.nextNodes || result.nextNodes.length === 0) {
      if (result.status !== 'error') {
        const final = finalize(dispatcher.getState());
        callback(final);
        return;
      }
    }

    // Emit the initial result and continue traversal
    callback(result);
    const status: ExecutionStatus[] = ['in_progress', 'waiting', 'error'];
    if (status.includes(result.status)) {
      await continueExecution(flow, result, callback, history, dispatcher);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Treat "no next node" style errors as a clean completion
    if (/no next node found in the flow/i.test(message) || /no next nodes?/i.test(message)) {
      const final = finalize(flowState);
      callback(final);
      return;
    }
    throw new Error(`Error in executeFlow: ${message}`);
  }
}
