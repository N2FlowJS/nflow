import { InputReference } from '../components/agent/types/flowTypes';

/**
 * Process input references and add them to the variables
 * This function can be used by any node type that supports input references
 * 
 * @param inputRefs Array of input references to process
 * @param variables The variables record to update with resolved references
 * @param additionalMappings Optional additional mappings for special variable names
 */
export function processInputReferences(
  inputRefs: InputReference[] | undefined,
  variables: Record<string, any>,
  additionalMappings: Record<string, string[]> = {}
): void {
  if (!inputRefs || !Array.isArray(inputRefs) || inputRefs.length === 0) {
    return;
  }
  
  // Default mappings for common variables
  const defaultMappings: Record<string, string[]> = {
    'userInput': ['userInput'],
    'generatedText': ['generatedText', 'generatedOutput'],
  };
  
  // Combine default mappings with additional ones
  const mappings = { ...defaultMappings, ...additionalMappings };
  
  inputRefs.forEach(ref => {
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

/**
 * Get the input value from source based on specified inputSource 
 * This function resolves the input value for any node that accepts inputs
 * 
 * @param inputSource The source identifier for the input
 * @param variables The variables available in the flow state
 * @param history Optional flow history for legacy behavior
 * @returns The resolved input value or null if not found
 */
export function getInputFromSource(
  inputSource: string | undefined,
  variables: Record<string, any>,
  history: any[] = []
): string | null {
  let input: string | null = null;
  
  if (inputSource) {
    // If a specific input source is set, use that
    switch (inputSource) {
      case 'user_input':
        input = variables.userInput || null;
        break;
      case 'generated_text':
        input = variables.generatedText || variables.generatedOutput || null;
        break;
      default:
        // Check if the source starts with "node:" for node-specific outputs
        if (inputSource.startsWith('node:')) {
          const nodeId = inputSource.substring(5); // Remove 'node:' prefix
          // Try to find any variables from this node
          for (const key in variables) {
            if (key.startsWith(`${nodeId}.`)) {
              input = variables[key];
              break;
            }
          }
        } else {
          // Check if the input source is a custom variable name
          input = variables[inputSource] || null;
        }
    }
  } else {
    // Fallback to legacy behavior - priority order
    const inputPriority = [
      variables.userInput,
      variables.generatedOutput,
      variables.generatedText,
      // Get the latest history item's output if available
      history.length > 0 ? history[history.length - 1].output : null
    ];
    
    // Find the first non-null value
    input = inputPriority.find(q => q !== null && q !== undefined) || null;
  }
  
  return input;
}
