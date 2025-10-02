import { FlowState } from '../models/flowExecution';


export function getQueryFromSource(inputRef: string[] = [], flowState: FlowState): string | null {
  const input: string[] = [];

  if (inputRef.length > 0) {
    // Iterate through the input source references to find the input
    for (const ref of inputRef) {
      if (ref) {
        if (flowState.components[ref] !== undefined) {
          input.push(flowState.components[ref].output);
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
