import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { TikTokExecutor } from './executor';

export async function executeTikTokNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new TikTokExecutor();
  return executor.execute(node, context, dispatcher);
}