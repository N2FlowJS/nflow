import FileWriteExecutor from './executor';
import { FlowExecutionContext, FlowNode, FlowStateDispatcher } from '@n2flowjs/flow';
import { ExecutionResult } from '@n2flowjs/flow';

export async function executeFileWriteNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = new FileWriteExecutor();
  return executor.execute(node, context, dispatcher);
}
