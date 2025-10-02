/**
 * Begin Node - NEW ARCHITECTURE
 * 
 * Flow entry point node with explicit output ports.
 * Migrated from legacy format to NodeDefinition format.
 */

import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { createOutputPort } from '../@flow/ports/utils';
import { BeginForm } from './types';

/**
 * Begin Node Definition
 * 
 * This is the entry point of a flow. It has no inputs (it's the start)
 * and outputs the initial content and variables.
 */
export const BeginNodeDefinition: NodeDefinition<BeginForm> = {
  // Metadata
  id: 'begin',
  name: 'Begin',
  category: NodeCategory.INPUT,
  description: 'Flow entry point - starts the execution flow',
  version: '2.0.0',
  
  // Visual
  color: '#52c41a',
  tags: ['start', 'entry', 'input'],
  
  // Configuration inputs
  inputs: [
    {
      id: 'variables',
      name: 'Variables',
      type: PortType.ARRAY,
      description: 'Flow variables to initialize',
      defaultValue: [],
      required: false,
      metadata: {
        inputType: 'array',
        placeholder: '[{"name": "varName", "value": "varValue"}]',
      },
    },
  ],
  
  // Output ports
  outputs: [
    createOutputPort('content', 'Content', PortType.TEXT, {
      description: 'Initial flow content or message',
      required: false,
    }),
    createOutputPort('variables', 'Variables', PortType.JSON, {
      description: 'Flow variables defined at start',
      required: false,
    }),
    createOutputPort('timestamp', 'Start Time', PortType.TEXT, {
      description: 'Flow start timestamp',
      required: false,
    }),
  ],
  
  // Execution function
  async execute(context: NodeExecutionContext<BeginForm>): Promise<NodeExecutionResult> {
    const { config, flowState, dispatcher } = context;
    const startTime = new Date().toISOString();
    
    // Initialize variables if provided
    const variables: Record<string, any> = {};
    
    if (Array.isArray(config.variables)) {
      config.variables.forEach((variable) => {
        if (variable.title) {
          // Initialize variable if not already in flow state
          if (!flowState?.variables?.[variable.title]) {
            variables[variable.title] = variable.title || '';
          }
        }
      });
    }
    
    // Update flow state through dispatcher
    if (dispatcher && Object.keys(variables).length > 0) {
      dispatcher.updateVariables(variables);
    }
    
    // Update node output
    if (dispatcher) {
      dispatcher.setNodeOutput(context.node.id, '', 'begin');
      dispatcher.setCurrentNode(context.node);
    }
    
    // Get content from form (if any)
    const content = (config as any).content || (config as any).description || '';
    
    return {
      outputs: {
        content,
        variables,
        timestamp: startTime,
      },
      status: 'success',
      metadata: {
        startTime,
        variableCount: Object.keys(variables).length,
      },
    };
  },
};

export default BeginNodeDefinition;
