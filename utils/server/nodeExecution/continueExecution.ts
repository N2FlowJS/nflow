import { Flow } from '../../../models/flowTypes';
import { EXECUTION_STATUS } from '../../../utils/server/EXECUTION_STATUS';
import { ExecutionResult } from '../../../models/flowExecutionTypes';
import { processNode } from './processNode';


export async function continueExecution(flow: Flow, result: ExecutionResult, callback: (result: ExecutionResult) => void): Promise<void> {
  if (result.nextNodes.length === 0)
    throw new Error(`No next nodes to continue execution for node ID: ${result.nodeInfo.id}`);

  for (const nodeId of result.nextNodes) {
    const nextResult = await processNode(flow, nodeId, result, callback);
    
    if (
      nextResult.status !== EXECUTION_STATUS.COMPLETED &&
      nextResult.nextNodes.length > 0
    ) {
      await continueExecution(
        flow,
        nextResult,
        callback,
      );
    }
  }
}
