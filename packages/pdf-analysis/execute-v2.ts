import { PdfAnalysisExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

/**
 * Backward-compatible execute wrapper for PdfAnalysis node
 */
export async function execute(
  node: FlowNode,
  context: any,
  dispatcher?: FlowStateDispatcher
): Promise<any> {
  const executor = new PdfAnalysisExecutor();
  // Compose minimal FlowExecutionContext
  return executor.execute(node, {
    flow: { nodes: [], edges: [] },
    flowState: context.flowState,
    input: { role: 'system', content: '' },
  }, dispatcher);
}
