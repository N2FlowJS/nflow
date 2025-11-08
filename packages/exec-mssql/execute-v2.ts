import { execMssqlExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for exec-mssql node execution
 */
export async function executeExecMssqlNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return execMssqlExecutor.execute(node, context, dispatcher);
}
