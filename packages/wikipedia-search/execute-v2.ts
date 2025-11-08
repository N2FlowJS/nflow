import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { WikipediaSearchExecutor } from './executor';

export async function executeWikipediaSearchNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: any
): Promise<ExecutionResult> {
  const executor = new WikipediaSearchExecutor();
  return executor.execute(node, context, dispatcher);
}