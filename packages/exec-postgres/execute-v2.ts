import { execPostgresExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for exec-postgres node execution
 */
export async function executeExecPostgresNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return execPostgresExecutor.execute(node, context, dispatcher);
}
