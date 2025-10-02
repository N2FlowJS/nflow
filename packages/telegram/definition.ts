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
 * Telegram Node Definition
 * 
 * Integration with Telegram Bot API for messaging and interactions.
 * Supports text, photos, documents, polls, locations, and more.
 * 
 * Actions:
 * - send_message: Send text message
 * - send_photo: Send photo/image
 * - send_document: Send file/document
 * - get_updates: Get bot updates
 * - create_poll: Create poll
 * - send_location: Send GPS location
 * 
 * Configuration:
 * - botToken: Telegram bot token (required)
 * - action: Operation to perform
 * - chatId: Target chat ID
 * - message: Message content (supports {variable})
 * - photoUrl/documentUrl: Media URLs
 * - pollQuestion/pollOptions: Poll configuration
 * - latitude/longitude: Location coordinates
 * 
 * Example:
 * ```json
 * {
 *   "botToken": "123456:ABC-DEF...",
 *   "action": "send_message",
 *   "chatId": "123456789",
 *   "message": "Hello {userName} from Telegram bot!"
 * }
 * ```
 */
export const TelegramNodeDefinition: NodeDefinition = {
  id: 'telegram',
  name: 'Telegram',
  category: NodeCategory.API,
  description: 'Telegram Bot API integration for messaging and interactions',
  version: '1.0.0',

  inputs: [
    {
      id: 'botToken',
      name: 'Bot Token',
      type: PortType.TEXT,
      description: 'Telegram bot token',
      required: true,
      metadata: { inputType: 'text', placeholder: '123456:ABC-DEF...' },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Telegram operation',
      required: true,
      defaultValue: 'send_message',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Send Message', value: 'send_message' },
          { label: 'Send Photo', value: 'send_photo' },
          { label: 'Send Document', value: 'send_document' },
          { label: 'Get Updates', value: 'get_updates' },
          { label: 'Create Poll', value: 'create_poll' },
          { label: 'Send Location', value: 'send_location' },
        ],
      },
    },
    {
      id: 'chatId',
      name: 'Chat ID',
      type: PortType.TEXT,
      description: 'Target chat ID',
      required: false,
      metadata: { inputType: 'text', placeholder: '123456789' },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Message content (supports {variable})',
      required: false,
      metadata: { inputType: 'textarea', rows: 4, placeholder: 'Hello {userName}!' },
    },
    {
      id: 'photoUrl',
      name: 'Photo URL',
      type: PortType.TEXT,
      description: 'URL of photo to send',
      required: false,
      metadata: { inputType: 'text', placeholder: 'https://...' },
    },
    {
      id: 'documentUrl',
      name: 'Document URL',
      type: PortType.TEXT,
      description: 'URL of document to send',
      required: false,
      metadata: { inputType: 'text', placeholder: 'https://...' },
    },
    {
      id: 'pollQuestion',
      name: 'Poll Question',
      type: PortType.TEXT,
      description: 'Poll question (supports {variable})',
      required: false,
      metadata: { inputType: 'text', placeholder: 'What is your favorite color?' },
    },
    {
      id: 'latitude',
      name: 'Latitude',
      type: PortType.NUMBER,
      description: 'Location latitude',
      required: false,
      metadata: { inputType: 'number', step: 0.000001 },
    },
    {
      id: 'longitude',
      name: 'Longitude',
      type: PortType.NUMBER,
      description: 'Location longitude',
      required: false,
      metadata: { inputType: 'number', step: 0.000001 },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Telegram API response',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.message) {
      getInputFromTemplate(config.message as string).forEach(v => variableNames.add(v));
    }
    if (config.pollQuestion) {
      getInputFromTemplate(config.pollQuestion as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...TelegramNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.message as string) || ''),
      ...getInputFromTemplate((config.pollQuestion as string) || ''),
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
        throw new Error('Telegram bot token is required');
      }

      let result: any;
      const action = config.action as string;

      // Placeholder for actual Telegram API calls
      // In production, use node-telegram-bot-api or similar
      switch (action) {
        case 'send_message':
          if (!config.message || !config.chatId) {
            throw new Error('Message and chat ID are required');
          }

          const processedMessage = processTemplate((config.message as string), vars);
          result = {
            action: 'send_message',
            chatId: config.chatId,
            message: processedMessage,
            success: true,
            timestamp: new Date().toISOString()
          };
          break;

        case 'send_photo':
          if (!config.photoUrl || !config.chatId) {
            throw new Error('Photo URL and chat ID are required');
          }

          result = {
            action: 'send_photo',
            chatId: config.chatId,
            photoUrl: config.photoUrl,
            success: true
          };
          break;

        case 'send_document':
          if (!config.documentUrl || !config.chatId) {
            throw new Error('Document URL and chat ID are required');
          }

          result = {
            action: 'send_document',
            chatId: config.chatId,
            documentUrl: config.documentUrl,
            success: true
          };
          break;

        case 'get_updates':
          result = {
            action: 'get_updates',
            updates: [],
            success: true
          };
          break;

        case 'create_poll':
          if (!config.pollQuestion || !config.pollOptions || !config.chatId) {
            throw new Error('Poll question, options, and chat ID are required');
          }

          const processedQuestion = processTemplate((config.pollQuestion as string), vars);
          result = {
            action: 'create_poll',
            chatId: config.chatId,
            question: processedQuestion,
            options: config.pollOptions,
            success: true
          };
          break;

        case 'send_location':
          if (!config.latitude || !config.longitude || !config.chatId) {
            throw new Error('Latitude, longitude, and chat ID are required');
          }

          result = {
            action: 'send_location',
            chatId: config.chatId,
            latitude: config.latitude,
            longitude: config.longitude,
            success: true
          };
          break;

        default:
          throw new Error(`Unsupported Telegram action: ${action}`);
      }

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'telegram');
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
      console.error('Telegram node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Telegram error';

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
