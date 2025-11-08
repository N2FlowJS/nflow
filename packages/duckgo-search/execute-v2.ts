import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { DuckGoSearchExecutor } from './executor';

export async function executeDuckGoSearchNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new DuckGoSearchExecutor();
  return executor.execute(node, context, dispatcher);
}