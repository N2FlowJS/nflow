import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { DiscordNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing Discord nodes
 */
export async function executeDiscordNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as DiscordNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.embedTitle || ''),
    ...getInputFromTemplate(form.embedDescription || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Discord operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'discord',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required API credentials
    if (!form.botToken) {
      throw new Error('Discord bot token is required');
    }

    console.log(`Executing Discord node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'send_message':
        if (!form.message || !form.channelId) {
          throw new Error('Message and channel ID are required for sending messages');
        }
        const processedMessage = processTemplate(form.message, vars);
        result = await sendDiscordMessage(form, processedMessage);
        break;

      case 'create_channel':
        if (!form.guildId) {
          throw new Error('Guild ID is required for creating channels');
        }
        result = await createDiscordChannel(form);
        break;

      case 'get_messages':
        if (!form.channelId) {
          throw new Error('Channel ID is required for getting messages');
        }
        result = await getDiscordMessages(form, form.channelId);
        break;

      case 'send_embed':
        if (!form.channelId || !form.embedTitle) {
          throw new Error('Channel ID and embed title are required for sending embeds');
        }
        const processedTitle = processTemplate(form.embedTitle, vars);
        const processedDescription = form.embedDescription ? processTemplate(form.embedDescription, vars) : '';
        result = await sendDiscordEmbed(form, processedTitle, processedDescription);
        break;

      case 'manage_roles':
        if (!form.guildId || !form.userId || !form.roleId) {
          throw new Error('Guild ID, user ID, and role ID are required for managing roles');
        }
        result = await manageDiscordRoles(form);
        break;

      case 'get_guild_info':
        if (!form.guildId) {
          throw new Error('Guild ID is required for getting guild info');
        }
        result = await getDiscordGuildInfo(form, form.guildId);
        break;

      default:
        throw new Error(`Unsupported Discord action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Discord node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'discord');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'discord';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'discord',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Discord execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Discord error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Discord operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'discord',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper functions for Discord API operations
async function sendDiscordMessage(credentials: any, message: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${credentials.channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${credentials.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function createDiscordChannel(form: any) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${form.guildId}/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${form.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'new-channel',
      type: 0 // Text channel
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getDiscordMessages(form: any, channelId: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=50`, {
    headers: {
      'Authorization': `Bot ${form.botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
}

async function sendDiscordEmbed(form: any, title: string, description: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${form.channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${form.botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [{
        title: title,
        description: description,
        color: parseInt(form.embedColor?.replace('#', '') || '0099ff', 16),
        timestamp: new Date().toISOString()
      }]
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Discord API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function manageDiscordRoles(form: any) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${form.guildId}/members/${form.userId}/roles/${form.roleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${form.botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return { success: true };
}

async function getDiscordGuildInfo(form: any, guildId: string) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      'Authorization': `Bot ${form.botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
}
