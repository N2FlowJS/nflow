import { FlowState } from "../../../models/flowExecutionTypes";


export async function prepareFlowState(flowState: FlowState): Promise<FlowState> {
  flowState.executionTime = Date.now();
 
  return flowState;
}
