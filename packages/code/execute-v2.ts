/**
 * Code Node Execute - Backward compatible wrapper
 */

import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow';
import { CodeExecutor } from './executor';

/**
 * Legacy execute function - delegates to new executor
 * @deprecated Use codeExecutor.execute() directly in new code
 */
export async function execute(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = new CodeExecutor();
  return executor.execute(node, context, dispatcher);
}

// Export as default for backward compatibility
export default execute;
