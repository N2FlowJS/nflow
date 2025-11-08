import { CsvAnalysisNodeExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow/type';
import { FlowExecutionContext } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

const executor = new CsvAnalysisNodeExecutor();

export async function executeCsvAnalysisNode(
  node: FlowNode,
  context: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
) {
  return executor.execute(node, context, dispatcher);
}
