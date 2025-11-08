import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { ConfluenceExecutor } from './executor';

export async function execute(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new ConfluenceExecutor();
  return executor.execute(node, context, dispatcher);
}