// Text Uppercase Node - Example of NEW node architecture
// This demonstrates the new port-based system

import { 
    NodeCategory,
    NodeDefinition,
  PortType,
  createInputPort,
  createOutputPort,
} from '@n2flowjs/flow';
import { TextUppercaseExecutor } from './executor';

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
  
  // Execution function delegated to executor
  async execute({ node, inputs, dispatcher }) {
    const executor = new TextUppercaseExecutor();
    // Merge config and inputs for form
  // No need for form variable
    // Minimal context for executor
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'user' as 'user', content: '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      const text = inputs.text || '';
      return {
        outputs: {
          result: output.execution.output,
          length: output.execution.output.length,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          originalLength: text.length,
          upperCaseCount: (text.match(/[A-Z]/g) || []).length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          result: '',
          length: 0,
        },
        status: 'error',
        error: `Uppercase processing failed: ${errorMessage}`,
        metadata: {
          originalLength: 0,
          upperCaseCount: 0,
        },
      };
    }
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
