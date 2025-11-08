import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { LinkedInExecutor } from './executor';

export async function executeLinkedInNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new LinkedInExecutor();
  return executor.execute(node, context, dispatcher);
}