import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';

export const AgentToolsNode: NodeDefinition = {
  id: 'agent-tools',
  name: 'Agent Tools',
  category: NodeCategory.AI,
  description: 'Defines a set of tools/functions that an AI agent can use during execution',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'tools',
      name: 'tools',
      type: PortType.ARRAY,
      description: 'List of tool IDs available to the agent',
    },
    {
      id: 'toolsJson',
      name: 'toolsJson',
      type: PortType.JSON,
      description: 'Tools configuration as JSON',
    },
  ],

  config: {
    properties: {
      toolIds: {
        type: 'array',
        title: 'Tool IDs',
        description: 'List of tool/function IDs to make available to the agent',
        items: {
          type: 'string',
        },
        default: [],
      },
      role: {
        type: 'string',
        title: 'Role',
        description: 'Role context for tool usage',
        enum: ['developer', 'assistant', 'system'],
        default: 'developer',
      },
    },
  },

  getDynamicInputs: () => {
    // No dynamic inputs - tools are configured statically
    return [];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config } = context;
    const { toolIds, role } = config;

    try {
      const tools = Array.isArray(toolIds) ? toolIds : [];

      const payload = {
        tools: tools,
        count: tools.length,
        role: role || 'developer',
      };

      return {
        outputs: {
          tools: tools,
          toolsJson: payload,
        },
        status: 'success',
        metadata: {
          toolCount: tools.length,
          role: role || 'developer',
          tools: tools,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          tools: [],
          toolsJson: { tools: [], count: 0 },
        },
        status: 'error',
        error: `Agent tools configuration failed: ${errorMessage}`,
      };
    }
  },
};
