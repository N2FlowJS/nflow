import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { GoogleSearchExecutor } from './executor';

export async function executeGoogleSearchNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new GoogleSearchExecutor();
  return executor.execute(node, context, dispatcher);
}