import FileReadExecutor from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { ExecutionResult } from '@n2flowjs/flow/type';

const executor = new FileReadExecutor();

export async function executeFileReadNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return executor.execute(node, context, dispatcher);
}

export default executeFileReadNode;
