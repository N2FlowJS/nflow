import { FlowState } from '../../../models';


export async function prepareFlowState(flowState: FlowState): Promise<FlowState> {
  for (const componentId in flowState.components) {
    if (flowState.components.hasOwnProperty(componentId)) {
      const component = flowState.components[componentId];
      component.output = "";
      component.ready = ['interface', 'begin'].includes(component.type) ? true : false;
    }
  }  
  return flowState;
}
