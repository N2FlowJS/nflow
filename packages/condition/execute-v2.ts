/**
 * Condition Node Execute - Backward compatible wrapper
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '../@flow';
import { FlowStateDispatcher } from '../@flow';
import { conditionExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use conditionExecutor.execute() directly in new code
 */
export async function execute(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return conditionExecutor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export default execute;
