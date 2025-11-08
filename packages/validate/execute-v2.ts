/**
 * Validate Node Execute - Backward compatible wrapper
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow';
import { validateExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use validateExecutor.execute() directly in new code
 */
export async function executeValidateNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return validateExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export { executeValidateNode as execute };
export default executeValidateNode;
