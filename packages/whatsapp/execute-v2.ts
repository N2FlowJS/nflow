import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { WhatsAppExecutor } from './executor';

export async function executeWhatsAppNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new WhatsAppExecutor();
  return executor.execute(node, context, dispatcher);
}