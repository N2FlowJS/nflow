import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { InstagramExecutor } from './executor';

export async function executeInstagramNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new InstagramExecutor();
  return executor.execute(node, context, dispatcher);
}