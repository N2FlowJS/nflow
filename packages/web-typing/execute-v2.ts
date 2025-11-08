import { webTypingExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for web-typing node execution
 */
export async function executeWebTypingNode(
  node: FlowNode,
  context: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return webTypingExecutor.execute(node, context, dispatcher);
}
