/**
 * Begin Node Execute - Backward compatible wrapper
 * Uses new executor architecture while maintaining old interface
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '../@flow/type';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import { beginExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use beginExecutor.execute() directly in new code
 */
export async function execute(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return beginExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export default execute;
