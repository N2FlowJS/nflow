import { InputReference } from '../types/flowTypes';
import { FlowState } from '../types/flowExecutionTypes';


export function getInputFromSource(inputRef: InputReference[] = [], flowState: FlowState): string | null {
  let input: string[] = [];

  if (inputRef.length > 0) {
    // Iterate through the input source references to find the input
    for (const ref of inputRef) {
      const { sourceNodeId, id } = ref;
      if (sourceNodeId) {
        const qualifiedName = `${id || sourceNodeId}`;
        if (flowState.components[qualifiedName] !== undefined) {
          input.push(flowState.components[qualifiedName].output);
        }
      }
    }
  }

  return input.join(' ') || null;
}

export function getInputs(nodeid: string, flowState: FlowState, inputs: string[] = []): string[] {
  const cpn = flowState.components[nodeid];
  if (cpn) {
    const inputFlow = cpn.inputFlow || [];
    for (const inputNode of inputFlow) {
      const { id } = inputNode;
      if (flowState.components[id] !== undefined) {
        if (!inputs.find(p => p == id)) inputs.push(id);
      }
    }
    const inputRefs = cpn.inputRefs || [];
    for (const ref of inputRefs) {
      const { sourceNodeId, id } = ref;
      if (sourceNodeId) {
        const qualifiedName = `${id || sourceNodeId}`;
        if (flowState.components[qualifiedName] !== undefined) {
          if (!inputs.find(p => p == qualifiedName)) inputs.push(qualifiedName);
        }
      }
    }
  }
  return inputs;
}
