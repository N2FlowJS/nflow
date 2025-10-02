/**
 * Discord Node Definition
 * 
 * Integration with Discord API for bot operations, messaging, and server management.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface DiscordConfig {
  name?: string;
  action: 'send_message' | 'create_channel' | 'get_messages' | 'send_embed' | 'manage_roles' | 'get_guild_info';
  botToken: string;
  channelId?: string;
  guildId?: string;
  userId?: string;
  roleId?: string;
  message?: string;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
}

const DiscordNodeDefinition: NodeDefinition<DiscordConfig> = {
  id: 'discord',
  name: 'Discord',
  category: NodeCategory.API,
  description: 'Integrate with Discord API for bot operations, messaging, and server management',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'botToken',
      name: 'Bot Token',
      type: PortType.TEXT,
      description: 'Discord bot token',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: 'Your Discord bot token',
      },
    },
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Discord operation to perform',
      required: true,
      defaultValue: 'send_message',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Send Message', value: 'send_message' },
          { label: 'Create Channel', value: 'create_channel' },
          { label: 'Get Messages', value: 'get_messages' },
          { label: 'Send Embed', value: 'send_embed' },
          { label: 'Manage Roles', value: 'manage_roles' },
          { label: 'Get Guild Info', value: 'get_guild_info' },
        ],
      },
    },
    {
      id: 'channelId',
      name: 'Channel ID',
      type: PortType.TEXT,
      description: 'Discord channel ID',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '123456789012345678',
      },
    },
    {
      id: 'guildId',
      name: 'Guild ID',
      type: PortType.TEXT,
      description: 'Discord server (guild) ID',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '123456789012345678',
      },
    },
    {
      id: 'userId',
      name: 'User ID',
      type: PortType.TEXT,
      description: 'Discord user ID',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '123456789012345678',
      },
    },
    {
      id: 'roleId',
      name: 'Role ID',
      type: PortType.TEXT,
      description: 'Discord role ID',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: '123456789012345678',
      },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Message content (supports {variable} templates)',
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 4,
        placeholder: 'Your message here...',
      },
    },
    {
      id: 'embedTitle',
      name: 'Embed Title',
      type: PortType.TEXT,
      description: 'Embed title (supports {variable} templates)',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'Embed Title',
      },
    },
    {
      id: 'embedDescription',
      name: 'Embed Description',
      type: PortType.TEXT,
      description: 'Embed description (supports {variable} templates)',
      required: false,
      metadata: {
        inputType: 'textarea',
        rows: 3,
        placeholder: 'Embed description...',
      },
    },
    {
      id: 'embedColor',
      name: 'Embed Color',
      type: PortType.TEXT,
      description: 'Embed color (hex format)',
      required: false,
      defaultValue: '#0099ff',
      metadata: {
        inputType: 'text',
        placeholder: '#0099ff',
      },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'Discord API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: DiscordConfig) => {
    const templateFields = [
      config.message,
      config.embedTitle,
      config.embedDescription,
    ].filter(Boolean);
    
    const variableNames = new Set<string>();
    templateFields.forEach(field => {
      if (field) {
        getInputFromTemplate(field).forEach(v => variableNames.add(v));
      }
    });
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: false,
      description: `Template variable: ${varName}`,
      metadata: {
        isDynamic: true,
        inputType: 'text',
      },
    }));

    return [
      ...DiscordNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      // Validate required API credentials
      if (!config.botToken) {
        throw new Error('Discord bot token is required');
      }
      
      // Prepare template variables
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      let result: any;
      
      switch (config.action) {
        case 'send_message':
          if (!config.message || !config.channelId) {
            throw new Error('Message and channel ID are required for sending messages');
          }
          const processedMessage = processTemplate(config.message, vars);
          result = await sendDiscordMessage(config, processedMessage);
          break;
          
        case 'create_channel':
          if (!config.guildId) {
            throw new Error('Guild ID is required for creating channels');
          }
          result = await createDiscordChannel(config);
          break;
          
        case 'get_messages':
          if (!config.channelId) {
            throw new Error('Channel ID is required for getting messages');
          }
          result = await getDiscordMessages(config, config.channelId);
          break;
          
        case 'send_embed':
          if (!config.channelId || !config.embedTitle) {
            throw new Error('Channel ID and embed title are required for sending embeds');
          }
          const processedTitle = processTemplate(config.embedTitle, vars);
          const processedDescription = config.embedDescription ? processTemplate(config.embedDescription, vars) : '';
          result = await sendDiscordEmbed(config, processedTitle, processedDescription);
          break;
          
        case 'manage_roles':
          if (!config.guildId || !config.userId || !config.roleId) {
            throw new Error('Guild ID, user ID, and role ID are required for managing roles');
          }
          result = await manageDiscordRoles(config);
          break;
          
        case 'get_guild_info':
          if (!config.guildId) {
            throw new Error('Guild ID is required for getting guild info');
          }
          result = await getDiscordGuildInfo(config, config.guildId);
          break;
          
        default:
          throw new Error(`Unsupported Discord action: ${config.action}`);
      }
      
      const resultText = JSON.stringify(result, null, 2);
      
      return {
        outputs: {
          output: resultText,
        },
        status: 'success',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: resultText,
          },
        },
      };
    } catch (error: any) {
      return {
        outputs: {},
        status: 'error',
        error: error?.message || 'Unknown Discord error',
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

// Helper functions for Discord API operations
async function sendDiscordMessage(config: DiscordConfig, message: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${config.channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${config.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function createDiscordChannel(config: DiscordConfig) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${config.guildId}/channels`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${config.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'new-channel',
      type: 0, // Text channel
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getDiscordMessages(config: DiscordConfig, channelId: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=50`, {
    headers: {
      Authorization: `Bot ${config.botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
}

async function sendDiscordEmbed(config: DiscordConfig, title: string, description: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${config.channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${config.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [
        {
          title: title,
          description: description,
          color: parseInt(config.embedColor?.replace('#', '') || '0099ff', 16),
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function manageDiscordRoles(config: DiscordConfig) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${config.guildId}/members/${config.userId}/roles/${config.roleId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${config.botToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return { success: true };
}

async function getDiscordGuildInfo(config: DiscordConfig, guildId: string) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${config.botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
}

export default DiscordNodeDefinition;
