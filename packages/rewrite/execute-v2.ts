import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { RewriteExecutor } from './executor';

const executor = new RewriteExecutor();

export async function executeRewriteNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return executor.execute(node, context, dispatcher);
}

export default executeRewriteNode;
