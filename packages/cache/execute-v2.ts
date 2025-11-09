import { cacheExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for Cache node execution
 */
export async function executeCacheNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await cacheExecutor.execute(node, context);
}

export default executeCacheNode;
