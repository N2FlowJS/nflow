import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

export const MattermostNode: NodeDefinition = {
  id: 'mattermost',
  name: 'Mattermost',
  category: NodeCategory.API,
  description: 'Integrates with Mattermost for team communication - send messages, create channels, and manage teams',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'result',
      name: 'result',
      type: PortType.JSON,
      description: 'API operation result',
    },
  ],

  config: {
    properties: {
      serverUrl: {
        type: 'string',
        title: 'Server URL',
        description: 'Mattermost server URL (e.g., https://your-mattermost.com)',
      },
      accessToken: {
        type: 'string',
        title: 'Access Token',
        description: 'Personal access token or bot token',
        format: 'password',
      },
      action: {
        type: 'string',
        title: 'Action',
        description: 'Mattermost operation to perform',
        enum: ['send_message', 'create_channel', 'get_channels', 'get_users'],
        default: 'send_message',
      },
      channelId: {
        type: 'string',
        title: 'Channel ID',
        description: 'Channel ID for sending messages',
      },
      channelName: {
        type: 'string',
        title: 'Channel Name',
        description: 'Channel name for creating channels (supports template variables)',
      },
      teamId: {
        type: 'string',
        title: 'Team ID',
        description: 'Team ID for channel operations',
      },
      message: {
        type: 'string',
        title: 'Message',
        description: 'Message to send (supports template variables)',
        format: 'textarea',
      },
    },
  },

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
    const { serverUrl, accessToken, action, channelId, channelName, teamId, message } = config;

    // Check if template variables are ready
    const templateVars = [
      ...getInputFromTemplate(message || ''),
      ...getInputFromTemplate(channelName || ''),
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
      // Validate required fields
      if (!serverUrl || !accessToken) {
        throw new Error('Mattermost server URL and access token are required');
      }

      // Prepare variables for template processing
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        vars[key] = String(inputs[key] || '');
      });

      let result: any;
      const apiUrl = `${serverUrl.replace(/\/$/, '')}/api/v4`;

      switch (action) {
        case 'send_message':
          if (!channelId || !message) {
            throw new Error('Channel ID and message are required for sending messages');
          }
          const processedMessage = processTemplate(message, vars);
          result = await sendMattermostMessage(apiUrl, accessToken, channelId, processedMessage);
          break;

        case 'create_channel':
          if (!channelName || !teamId) {
            throw new Error('Channel name and team ID are required for creating channels');
          }
          const processedChannelName = processTemplate(channelName, vars);
          result = await createMattermostChannel(apiUrl, accessToken, teamId, processedChannelName);
          break;

        case 'get_channels':
          if (!teamId) {
            throw new Error('Team ID is required for getting channels');
          }
          result = await getMattermostChannels(apiUrl, accessToken, teamId);
          break;

        case 'get_users':
          result = await getMattermostUsers(apiUrl, accessToken);
          break;

        default:
          throw new Error(`Unsupported Mattermost action: ${action}`);
      }

      return {
        outputs: {
          result,
        },
        status: 'success',
        metadata: {
          action,
          serverUrl,
          ...(channelId && { channelId }),
          ...(teamId && { teamId }),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {},
        status: 'error',
        error: `Mattermost operation failed: ${errorMessage}`,
        metadata: {
          action,
        },
      };
    }
  },
};

// Helper functions
async function sendMattermostMessage(apiUrl: string, accessToken: string, channelId: string, message: string) {
  const response = await fetch(`${apiUrl}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_id: channelId,
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function createMattermostChannel(apiUrl: string, accessToken: string, teamId: string, channelName: string) {
  const response = await fetch(`${apiUrl}/channels`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      team_id: teamId,
      name: channelName.toLowerCase().replace(/\s+/g, '-'),
      display_name: channelName,
      type: 'O', // Open channel
    }),
  });

  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getMattermostChannels(apiUrl: string, accessToken: string, teamId: string) {
  const response = await fetch(`${apiUrl}/teams/${teamId}/channels`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getMattermostUsers(apiUrl: string, accessToken: string) {
  const response = await fetch(`${apiUrl}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
