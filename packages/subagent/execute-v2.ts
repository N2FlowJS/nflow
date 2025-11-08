import { subAgentExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for sub-agent node execution
 */
export async function executeSubAgentNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return subAgentExecutor.execute(node, context, dispatcher);
}
