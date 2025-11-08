import { webClickExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for web-click node execution
 */
export async function executeWebClickNode(
  node: FlowNode,
  context: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return webClickExecutor.execute(node, context, dispatcher);
}
