import { mathExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for Math node execution
 */
export async function executeMathNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await mathExecutor.execute(node, context);
}

export default executeMathNode;
