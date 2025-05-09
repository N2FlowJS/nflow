import { FlowState } from '../../models/flowExecutionTypes';

export function isNodeReady(inputs: string[], flowState: FlowState): boolean {
  if (inputs.length === 0) return true;
  return inputs.every((input: string) => {
    const component = flowState.components[input];
    return component && component.executionTime > flowState.executionTime;
  });
}

