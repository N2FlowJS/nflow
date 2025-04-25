import { Flow, ExecutionResult } from '../../../models';
import { executeNode } from './node/executeNode';
import { EXECUTION_STATUS } from '../EXECUTION_STATUS';

export async function processNode(
  flow: Flow,
  nodeId: string,
  prevResult: ExecutionResult,
  callback: (result: ExecutionResult) => void): Promise<ExecutionResult> {
  const nextNode = flow.nodes.find((node) => node.id === nodeId);
  if (!nextNode) throw new Error(`Node with ID ${nodeId} not found in the flow`);

  const nextResult = await executeNode(nextNode, {
    flow,
    flowState: prevResult.flowState,
    input: {
      content: prevResult.execution.output,
      role: prevResult.nodeInfo.role,
    },
  }, callback);

  if (nextResult.execution.output) {
    nextResult.flowState.history.push({
      nodeId: nextResult.nodeInfo.id,
      output: nextResult.execution.output,
      timestamp: new Date().toISOString(),
      nodeType: nextResult.nodeInfo.type,
    });
  }

  callback(nextResult);

  if (nextResult.status === EXECUTION_STATUS.ERROR)
    throw new Error(`Error in node ${nextNode.id}: ${nextResult.message}`);

  return nextResult;
}
