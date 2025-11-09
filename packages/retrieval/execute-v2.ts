import { retrievalExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for Retrieval node execution
 */
export async function executeRetrievalNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await retrievalExecutor.execute(node, context);
}

export default executeRetrievalNode;
