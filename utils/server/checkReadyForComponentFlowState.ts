import { getInputs } from '@hooks/useInputReferences';
import { FlowState } from '../../types';

export function checkReadyForComponentFlowState(nodeid: string, flowState: FlowState): boolean {
  const inputs = getInputs(nodeid, flowState, []);
  console.log(nodeid, 'inputs', inputs);
  let ready = true;
  if (inputs.length === 0) return true;
  for (const input of inputs) {
    const component = flowState.components[input];
    console.log('component: ', input, component.ready);

    if (!component || !component.ready) {
      ready = false;
      break;
    }
  }
  console.log(nodeid, 'ready', ready);

  return ready;
}
