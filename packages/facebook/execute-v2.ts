import { facebookExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for facebook node execution
 */
export async function executeFacebookNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return facebookExecutor.execute(node, context, dispatcher);
}
