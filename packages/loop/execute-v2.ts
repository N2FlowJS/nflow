/**
 * Loop Node Execute - Backward compatible wrapper
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow';
import { loopExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use loopExecutor.execute() directly in new code
 */
export async function executeLoopNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return loopExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export { executeLoopNode as execute };
export default executeLoopNode;
