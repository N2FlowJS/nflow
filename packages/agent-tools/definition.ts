import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';

export const AgentToolsNode: NodeDefinition = {
  id: 'agent-tools',
  name: 'Agent Tools',
  category: NodeCategory.AI,
  description: 'Defines a set of tools/functions that an AI agent can use during execution',
  version: '1.0.0',

  inputs: [
    {
      id: 'toolIds',
      name: 'Tool IDs',
      type: PortType.TEXT,
      description: 'Comma-separated list of tool/function IDs to make available to the agent',
      required: false,
      defaultValue: '',
      metadata: { inputType: 'textarea', placeholder: 'tool1, tool2, tool3' },
    },
    {
      id: 'role',
      name: 'Role',
      type: PortType.TEXT,
      description: 'Role context for tool usage',
      required: false,
      defaultValue: 'developer',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Developer', value: 'developer' },
          { label: 'Assistant', value: 'assistant' },
          { label: 'System', value: 'system' },
        ],
      },
    },
  ] as InputPort[],

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
  ] as OutputPort[],

  getDynamicInputs: () => {
    return [...AgentToolsNode.inputs];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const toolIdsInput = (inputs.toolIds || config.toolIds || '') as string;
    const role = (inputs.role || config.role || 'developer') as string;

    try {
      const tools = toolIdsInput ? toolIdsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

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
