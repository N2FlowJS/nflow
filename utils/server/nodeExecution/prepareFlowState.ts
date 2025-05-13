import { FlowState } from '../../../models/flowExecutionTypes';

export function prepareFlowState(flowState: FlowState): FlowState {
  flowState.executionTime = Date.now() - 10;
  return flowState;
}
