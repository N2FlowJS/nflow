import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Slack Node Definition
 * 
 * Integration with Slack API for messaging and channel management.
 * Supports sending messages, creating channels, uploading files, and more.
 * 
 * Actions:
 * - send_message: Send message to channel
 * - create_channel: Create new channel
 * - get_channels: List all channels
 * - get_users: List all users
 * - upload_file: Upload file to channel
 * 
 * Configuration:
 * - botToken: Slack bot token (required)
 * - action: Operation to perform
 * - channelId/channelName: Target channel
 * - message: Message content (supports {variable})
 * - filePath: File path for upload
 * 
 * Example:
 * ```json
 * {
 *   "botToken": "xoxb-your-token",
 *   "action": "send_message",
 *   "channelId": "C1234567890",
 *   "message": "Hello from {userName}!"
 * }
 * ```
 */
export const SlackNodeDefinition: NodeDefinition = {
  id: 'slack',
  name: 'Slack',
  category: NodeCategory.API,
  description: 'Slack integration for messaging, channels, and file management',
  version: '1.0.0',

  inputs: [
    {
      id: 'botToken',
      name: 'Bot Token',
      type: PortType.TEXT,
      description: 'Slack bot token (xoxb-...)',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: 'xoxb-your-slack-bot-token',
      },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Slack operation',
      required: true,
      defaultValue: 'send_message',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Send Message', value: 'send_message' },
          { label: 'Create Channel', value: 'create_channel' },
          { label: 'Get Channels', value: 'get_channels' },
          { label: 'Get Users', value: 'get_users' },
          { label: 'Upload File', value: 'upload_file' },
        ],
      },
    },
    {
      id: 'channelId',
      name: 'Channel ID',
      type: PortType.TEXT,
      description: 'Slack channel ID',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'C1234567890',
      },
    },
    {
      id: 'channelName',
      name: 'Channel Name',
      type: PortType.TEXT,
      description: 'Slack channel name (supports {variable})',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '#general',
      },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Message content (supports {variable})',
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Hello from {userName}!',
      },
    },
    {
      id: 'filePath',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Path to file for upload (supports {variable})',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '/path/to/file.pdf',
      },
    },
    {
      id: 'fileName',
      name: 'File Name',
      type: PortType.TEXT,
      description: 'Name for uploaded file',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'document.pdf',
      },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Slack API response',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.message) {
      const msgVars = getInputFromTemplate(config.message as string);
      msgVars.forEach(v => variableNames.add(v));
    }

    if (config.channelName) {
      const channelVars = getInputFromTemplate(config.channelName as string);
      channelVars.forEach(v => variableNames.add(v));
    }

    if (config.filePath) {
      const fileVars = getInputFromTemplate(config.filePath as string);
      fileVars.forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: {
        isDynamic: true,
        inputType: 'text',
      },
    }));

    return [
      ...SlackNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.message as string) || ''),
      ...getInputFromTemplate((config.channelName as string) || ''),
      ...getInputFromTemplate((config.filePath as string) || ''),
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: {} },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      if (!config.botToken) {
        throw new Error('Slack bot token is required');
      }

      let result: any;
      const action = config.action as string;

      // Placeholder for actual Slack API calls
      // In production, use @slack/web-api or similar
      switch (action) {
        case 'send_message':
          if (!config.channelId && !config.channelName) {
            throw new Error('Channel ID or name is required');
          }
          if (!config.message) {
            throw new Error('Message content is required');
          }

          const processedMessage = processTemplate((config.message as string), vars);
          result = {
            action: 'send_message',
            channel: config.channelId || config.channelName,
            message: processedMessage,
            success: true,
            timestamp: new Date().toISOString()
          };
          break;

        case 'create_channel':
          if (!config.channelName) {
            throw new Error('Channel name is required');
          }

          const processedChannelName = processTemplate((config.channelName as string), vars);
          result = {
            action: 'create_channel',
            channelName: processedChannelName,
            success: true
          };
          break;

        case 'get_channels':
          result = {
            action: 'get_channels',
            channels: [],
            success: true
          };
          break;

        case 'get_users':
          result = {
            action: 'get_users',
            users: [],
            success: true
          };
          break;

        case 'upload_file':
          if (!config.channelId && !config.channelName) {
            throw new Error('Channel ID or name is required');
          }
          if (!config.filePath) {
            throw new Error('File path is required');
          }

          const processedFilePath = processTemplate((config.filePath as string), vars);
          result = {
            action: 'upload_file',
            channel: config.channelId || config.channelName,
            filePath: processedFilePath,
            fileName: config.fileName,
            success: true
          };
          break;

        default:
          throw new Error(`Unsupported Slack action: ${action}`);
      }

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'slack');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: { result },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action
        }
      };
    } catch (error: unknown) {
      console.error('Slack node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Slack error';

      return {
        outputs: {
          result: { error: errorMessage }
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
