// Text Uppercase Node - Example of NEW node architecture
// This demonstrates the new port-based system

import { 
    NodeCategory,
    NodeDefinition,
  PortType,
  createInputPort,
  createOutputPort,
} from '@n2flowjs/flow';

/**
 * Text Uppercase Node Definition
 * 
 * Simple example showing:
 * - Explicit input/output ports
 * - Type validation
 * - Clear execution contract
 */
export const TextUppercaseNode: NodeDefinition = {
  // Metadata
  id: 'text-uppercase',
  name: 'To Uppercase',
  description: 'Convert text to uppercase letters',
  category: NodeCategory.TRANSFORM,
  version: '1.0.0',
  tags: ['text', 'transform', 'uppercase'],
  
  // Input ports - explicitly defined!
  inputs: [
    createInputPort('text', 'Text', PortType.TEXT, {
      required: true,
      description: 'The text to convert to uppercase',
      defaultValue: '',
    }),
  ],
  
  // Output ports - explicitly defined!
  outputs: [
    createOutputPort('result', 'Result', PortType.TEXT, {
      description: 'The uppercase text',
    }),
    createOutputPort('length', 'Length', PortType.NUMBER, {
      description: 'Length of the result',
    }),
  ],
  
  // Execution function with clear input/output contract
  async execute({ inputs }) {
    const text = inputs.text || '';
    const result = text.toUpperCase();
    
    return {
      outputs: {
        result,
        length: result.length,
      },
      status: 'success',
      metadata: {
        originalLength: text.length,
        upperCaseCount: (text.match(/[A-Z]/g) || []).length,
      },
    };
  },
  
  // Validation (optional)
  validation: (node) => {
    if (!node.data?.form?.name) {
      return { valid: false, error: 'Node name is required' };
    }
    return { valid: true };
  },
};

export default TextUppercaseNode;
