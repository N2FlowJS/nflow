import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import MattermostExecutor from './executor';

export const MattermostNode: NodeDefinition = {
  id: 'mattermost',
  name: 'Mattermost',
  category: NodeCategory.API,
  description: 'Integrates with Mattermost for team communication - send messages, create channels, and manage teams',
  version: '1.0.0',

  inputs: [
    {
      id: 'name',
      name: 'Node Name',
      type: PortType.TEXT,
      description: 'Display name for this Mattermost node',
      defaultValue: 'Mattermost Integration',
      required: true,
      metadata: {
        inputType: 'text',
      },
    },
    {
      id: 'description',
      name: 'Description',
      type: PortType.TEXT,
      description: 'Optional description for this node',
      defaultValue: '',
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 2,
      },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Mattermost operation to perform',
      defaultValue: 'send_message',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['send_message', 'create_channel', 'get_channels', 'get_users'],
      },
    },
    {
      id: 'serverUrl',
      name: 'Server URL',
      type: PortType.TEXT,
      description: 'Mattermost server URL (e.g., https://mattermost.example.com)',
      required: true,
      metadata: {
        inputType: 'url',
        placeholder: 'https://mattermost.example.com',
      },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'Personal Access Token for Mattermost API',
      required: true,
      metadata: {
        inputType: 'password',
      },
    },
    {
      id: 'channelId',
      name: 'Channel ID',
      type: PortType.TEXT,
      description: 'Channel ID for sending messages (required for send_message action)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'channel-id-here',
      },
    },
    {
      id: 'channelName',
      name: 'Channel Name',
      type: PortType.TEXT,
      description: 'Name for new channel (required for create_channel action). Use {variables} for dynamic content.',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'my-new-channel',
      },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Message content to send (required for send_message action). Use {variables} for dynamic content.',
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Hello from NFlow! {custom_message}',
      },
    },
    {
      id: 'username',
      name: 'Username',
      type: PortType.TEXT,
      description: 'Username override. Use {variables} for dynamic content.',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'bot-user',
      },
    },
    {
      id: 'teamId',
      name: 'Team ID',
      type: PortType.TEXT,
      description: 'Team ID (required for create_channel and get_channels actions)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'team-id-here',
      },
    },
  ],

  outputs: [
    {
      id: 'result',
      name: 'result',
      type: PortType.JSON,
      description: 'API operation result',
    },
  ],

  getDynamicInputs: (config: any) => {
    const variableNames: string[] = [];
    if (config.message) {
      variableNames.push(...getInputFromTemplate(config.message));
    }
    if (config.channelName) {
      variableNames.push(...getInputFromTemplate(config.channelName));
    }
    return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const templateVars = [
      ...getInputFromTemplate(config.message || ''),
      ...getInputFromTemplate(config.channelName || ''),
    ];
    for (const varName of templateVars) {
      if (!inputs[varName]) {
        return {
          outputs: { result: null },
          status: 'success',
          metadata: {
            waitingFor: templateVars,
          },
        };
      }
    }
    try {
      // Prepare templateVariables for executor
      const templateVariables: Record<string, string> = {};
      templateVars.forEach((key) => {
        templateVariables[key] = String(inputs[key] || '');
      });
      // Build ExecutionContext for executor
      // (executorContext is not needed)
      const executor = new MattermostExecutor();
      // Build a minimal FlowNode and FlowExecutionContext for the executor
      const node = { id: 'mattermost', data: { form: config } } as any;
      const flowExecutionContext = { flow: {}, flowState: {} } as any;
      const execResult = await executor.execute(node, flowExecutionContext);
      return {
        outputs: { result: execResult },
        status: execResult?.status === 'error' ? 'error' : 'success',
  error: execResult?.status === 'error' ? execResult?.message : undefined,
        metadata: {
          action: config.action,
          serverUrl: config.serverUrl,
          ...(config.channelId && { channelId: config.channelId }),
          ...(config.teamId && { teamId: config.teamId }),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {},
        status: 'error',
        error: `Mattermost operation failed: ${errorMessage}`,
        metadata: {
          action: config.action,
        },
      };
    }
  },
};
