import GitHubExecutor from './executor';
import { FlowNode, FlowExecutionContext } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { ExecutionResult } from '@n2flowjs/flow/type';

/**
 * Backward compatible execute function for GitHub node
 */
export async function execute(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = new GitHubExecutor();
  return executor.execute(node, context, dispatcher);
}
