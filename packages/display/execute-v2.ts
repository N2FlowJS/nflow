/**
 * Display Node Execute - Backward compatible wrapper
 * Uses new executor architecture while maintaining old interface
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow';
import { displayExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use displayExecutor.execute() directly in new code
 */
export async function executeDisplayNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return displayExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export { executeDisplayNode as execute };
export default executeDisplayNode;
