import { FlowState } from "@n2flowjs/flow";

export function prepareFlowState(flowState: FlowState): FlowState {
  flowState.executionTime = Date.now() - 10;
  return flowState;
}
