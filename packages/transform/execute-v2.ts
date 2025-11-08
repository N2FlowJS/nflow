import { TransformExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

const executor = new TransformExecutor();

export async function executeTransformNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return executor.execute(node, context, dispatcher);
}

export default executeTransformNode;
