import { ImageAnalysisExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

export async function executeImageAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const executor = new ImageAnalysisExecutor();
  // Merge config and inputs for form
  const form = node.data?.form || {};
  const context = {
    flow,
    flowState,
    input: { role: 'developer' as 'developer', content: form.imagePath || '' },
  };
  const output = await executor.execute(node, context, dispatcher);
  return {
    nextNodes: [],
    status: output.status === 'error' ? 'error' : 'ended',
    message: output.status === 'error' ? (output as any).error ?? (output as any).metadata?.error ?? 'Error' : 'Image analysis complete',
    flowState,
    nodeInfo: {
      id: node.id,
      name: node.data?.label || node.id,
      type: 'imageanalysis',
      role: 'developer',
    },
    execution: {
      output: (output as any).outputs?.result,
      nodeId: node.id,
      nodeName: node.data?.label || node.id,
      startTime: (output as any).metadata?.startTime,
      endTime: (output as any).metadata?.endTime,
    },
  };
}
