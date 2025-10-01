import { FlowState } from "./type";

export function isNodeReady(inputs: string[], flowState: FlowState): boolean {
  if (inputs.length === 0) return true;
  return inputs.every((input: string) => {
    const component = flowState.components[input];
    if (component && component.executionTime) {
      return component.executionTime > flowState.executionTime;
    }
    return true;
  });
}
