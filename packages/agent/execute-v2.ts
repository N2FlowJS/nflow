import { agentExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for agent node execution
 */
export async function executeAgentNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return agentExecutor.execute(node, context, dispatcher);
}
