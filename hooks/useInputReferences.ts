import { InputReference } from '../components/agent/types/flowTypes';
import { FlowState } from '../types/flowExecutionTypes';

/**
 * Process input references and add them to the variables
 * This function can be used by any node type that supports input references
 *
 * @param inputRefs Array of input references to process
 * @param variables The variables record to update with resolved references
 * @param additionalMappings Optional additional mappings for special variable names
 */
export function processInputReferences(inputRefs: InputReference[] | undefined, variables: Record<string, any>, additionalMappings: Record<string, string[]> = {}): void {
  if (!inputRefs || !Array.isArray(inputRefs) || inputRefs.length === 0) {
    return;
  }

  // Default mappings for common variables
  const defaultMappings: Record<string, string[]> = {
    userInput: ['userInput'],
    generatedText: ['generatedText', 'generatedOutput'],
  };

  // Combine default mappings with additional ones
  const mappings = { ...defaultMappings, ...additionalMappings };

  inputRefs.forEach((ref) => {
    if (!ref.sourceNodeId || !ref.outputName || !ref.inputName) {
      return;
    }

    // First try to find a node-qualified output
    const qualifiedName = `${ref.sourceNodeId}.${ref.outputName}`;

    if (variables[qualifiedName] !== undefined) {
      // Found the reference, store it under the inputName
      variables[ref.inputName] = variables[qualifiedName];
      return;
    }

    // Also check for direct variable references without qualification
    if (variables[ref.outputName] !== undefined) {
      variables[ref.inputName] = variables[ref.outputName];
      return;
    }

    // Special handling for mapped variables
    const mappedVariables = mappings[ref.outputName];
    if (mappedVariables) {
      for (const varName of mappedVariables) {
        if (variables[varName] !== undefined) {
          variables[ref.inputName] = variables[varName];
          return;
        }
      }
    }
  });
}

export function getInputFromSource(inputRef: InputReference[] = [], flowState: FlowState): string | null {
  let input: string[] = [];

  if (inputRef.length > 0) {
    // Iterate through the input source references to find the input
    for (const ref of inputRef) {
      const { sourceNodeId, outputName } = ref;
      if (sourceNodeId && outputName) {
        const qualifiedName = `${sourceNodeId}`;
        if (flowState.components[qualifiedName] !== undefined) {
          input.push(flowState.components[qualifiedName].output);
          break;
        }
      }
    }
  }

  return input.join(' ') || null;
}
