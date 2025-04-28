import { getInputs } from '@/hooks/useInputReferences';
import { FlowState } from '@/models/flowExecutionTypes';

export function isNodeReady(nodeid: string, flowState: FlowState): boolean {
  const inputs = getInputs(nodeid, flowState, []);
  if (inputs.length === 0) return true;
  return inputs.every(input => {
    const component = flowState.components[input];
    return component && component.ready;
  });
}

