import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, FlowNode, FlowExecutionContext, ExecutionResult } from '@n2flowjs/flow';
import { MattermostNodeData } from './types';

/**
 * Handler for executing Mattermost nodes
 */
export async function executeMattermostNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as MattermostNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields based on action
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.channelName || ''),
    ...getInputFromTemplate(form.username || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Mattermost operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'mattermost',
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
    // Validate required fields
    if (!form.serverUrl || !form.accessToken) {
      throw new Error('Mattermost server URL and access token are required');
    }

    console.log(`Executing Mattermost node: ${node.id} with action: ${form.action}`);

    let result: any;
    let apiUrl = `${form.serverUrl.replace(/\/$/, '')}/api/v4`;

    switch (form.action) {
      case 'send_message':
        if (!form.channelId) {
          throw new Error('Channel ID or channel name is required for sending messages');
        }
        if (!form.channelName) {
          throw new Error('Channel ID or channel name is required for sending messages');
        }
        if (!form.message) {
          throw new Error('Message content is required');
        }

        const processedMessage = processTemplate(form.message, vars);
        result = await sendMattermostMessage(apiUrl, form.accessToken, form.channelId, processedMessage);
        break;

      case 'create_channel':
        if (!form.channelName || !form.teamId) {
          throw new Error('Channel name and team ID are required for creating channels');
        }

        const processedChannelName = processTemplate(form.channelName, vars);
        result = await createMattermostChannel(apiUrl, form.accessToken, form.teamId, processedChannelName);
        break;

      case 'get_channels':
        if (!form.teamId) {
          throw new Error('Team ID is required for getting channels');
        }

        result = await getMattermostChannels(apiUrl, form.accessToken, form.teamId);
        break;

      case 'get_users':
        result = await getMattermostUsers(apiUrl, form.accessToken);
        break;

      default:
        throw new Error(`Unsupported Mattermost action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`Mattermost node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'mattermost');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'mattermost';
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
        type: 'mattermost',
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
    console.error('Mattermost execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Mattermost error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Mattermost operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'mattermost',
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

// Helper functions for Mattermost API operations
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
