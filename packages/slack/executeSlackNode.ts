import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { SlackNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing Slack nodes
 */
export async function executeSlackNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as SlackNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.channelName || ''),
    ...getInputFromTemplate(form.filePath || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Slack operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'slack',
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
    if (!form.botToken) {
      throw new Error('Slack bot token is required');
    }

    console.log(`Executing Slack node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'send_message':
        if (!form.channelId && !form.channelName) {
          throw new Error('Channel ID or channel name is required for sending messages');
        }
        if (!form.message) {
          throw new Error('Message content is required');
        }

        const processedMessage = processTemplate(form.message, vars);
        result = await sendSlackMessage(form.botToken, form.channelId || form.channelName!, processedMessage);
        break;

      case 'create_channel':
        if (!form.channelName) {
          throw new Error('Channel name is required for creating channels');
        }
        
        const processedChannelName = processTemplate(form.channelName, vars);
        result = await createSlackChannel(form.botToken, processedChannelName);
        break;

      case 'get_channels':
        result = await getSlackChannels(form.botToken);
        break;

      case 'get_users':
        result = await getSlackUsers(form.botToken);
        break;

      case 'upload_file':
        if (!form.channelId && !form.channelName) {
          throw new Error('Channel ID or channel name is required for file upload');
        }
        if (!form.filePath) {
          throw new Error('File path is required for file upload');
        }

        const processedFilePath = processTemplate(form.filePath, vars);
        result = await uploadSlackFile(form.botToken, form.channelId || form.channelName!, processedFilePath, form.fileName);
        break;

      default:
        throw new Error(`Unsupported Slack action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Slack node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'slack');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'slack';
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
        type: 'slack',
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
    console.error('Slack execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Slack error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Slack operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'slack',
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

// Helper functions for Slack API operations
async function sendSlackMessage(botToken: string, channel: string, text: string) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channel,
      text: text,
    }),
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

async function createSlackChannel(botToken: string, channelName: string) {
  const response = await fetch('https://slack.com/api/conversations.create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: channelName.toLowerCase().replace(/\s+/g, '-'),
    }),
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

async function getSlackChannels(botToken: string) {
  const response = await fetch('https://slack.com/api/conversations.list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${botToken}`,
    },
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

async function getSlackUsers(botToken: string) {
  const response = await fetch('https://slack.com/api/users.list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${botToken}`,
    },
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

async function uploadSlackFile(botToken: string, channel: string, filePath: string, fileName?: string) {
  // Note: This is a simplified version. In a real implementation, you'd need to handle file reading
  const response = await fetch('https://slack.com/api/files.upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
    },
    body: JSON.stringify({
      channels: channel,
      filename: fileName || 'file',
      filetype: 'text',
      content: filePath, // In real implementation, read file content
    }),
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}
