/**
 * Agent Node Definition
 * 
 * Placeholder node for future agent orchestration functionality.
 * Currently serves as a simple pass-through node.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType } from '@n2flowjs/flow/ports';

interface AgentConfig {
  name?: string;
}

const AgentNodeDefinition: NodeDefinition<AgentConfig> = {
  id: 'agent',
  name: 'Agent',
  category: NodeCategory.AI,
  description: 'Agent orchestration node (placeholder for future LLM agent functionality)',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'name',
      name: 'Agent Name',
      type: PortType.TEXT,
      defaultValue: 'agent',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Enter agent name',
      },
    },
    {
      id: 'input',
      name: 'Input',
      type: PortType.TEXT,
      required: false,
    },
  ],
  
  outputs: [
    {
      id: 'output',
      name: 'Output',
      type: PortType.TEXT,
    },
  ],
  
  async execute({ config, node }) {
    const startTime = new Date().toISOString();
    
    try {
      // Placeholder logic - return agent name as output
      const output = config.name || 'agent';
      
      return {
        outputs: {
          output,
        },
        status: 'success',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output,
          },
        },
      };
    } catch (error: any) {
      return {
        outputs: {},
        status: 'error',
        error: error?.message || 'Unknown agent error',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: `Error: ${error?.message}`,
          },
        },
      };
    }
  },
};

export default AgentNodeDefinition;
