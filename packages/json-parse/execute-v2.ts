import { JsonParseExecutor } from './executor';
import { FlowExecutionContext, FlowNode, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

export async function executeJsonParseNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = new JsonParseExecutor();
  return executor.execute(node, context, dispatcher);
}
