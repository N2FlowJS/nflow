/**
 * Delay Node Execute - Backward compatible wrapper
 * Uses new executor architecture while maintaining old interface
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow';
import { delayExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use delayExecutor.execute() directly in new code
 */
export async function executeDelayNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return delayExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export { executeDelayNode as execute };
export default executeDelayNode;
