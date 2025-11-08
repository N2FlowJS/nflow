import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { TelegramExecutor } from './executor';

export async function executeTelegramNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new TelegramExecutor();
  return executor.execute(node, context, dispatcher);
}