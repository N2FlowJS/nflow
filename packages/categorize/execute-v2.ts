import { categorizeExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for Categorize node execution
 */
export async function executeCategorizeNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await categorizeExecutor.execute(node, context);
}

export default executeCategorizeNode;
