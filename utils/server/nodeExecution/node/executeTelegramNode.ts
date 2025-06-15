import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { TelegramNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Telegram nodes
 */
export async function executeTelegramNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TelegramNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.pollQuestion || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Telegram operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'telegram',
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
      throw new Error('Telegram bot token is required');
    }

    console.log(`Executing Telegram node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'send_message':
        if (!form.message || !form.chatId) {
          throw new Error('Message and chat ID are required for sending messages');
        }
        const processedMessage = processTemplate(form.message, vars);
        result = await sendTelegramMessage(form, processedMessage);
        break;

      case 'send_photo':
        if (!form.photoUrl || !form.chatId) {
          throw new Error('Photo URL and chat ID are required for sending photos');
        }
        result = await sendTelegramPhoto(form);
        break;

      case 'send_document':
        if (!form.documentUrl || !form.chatId) {
          throw new Error('Document URL and chat ID are required for sending documents');
        }
        result = await sendTelegramDocument(form);
        break;

      case 'get_updates':
        result = await getTelegramUpdates(form);
        break;

      case 'create_poll':
        if (!form.pollQuestion || !form.pollOptions || !form.chatId) {
          throw new Error('Poll question, options, and chat ID are required for creating polls');
        }
        const processedQuestion = processTemplate(form.pollQuestion, vars);
        result = await createTelegramPoll(form, processedQuestion);
        break;

      case 'send_location':
        if (!form.latitude || !form.longitude || !form.chatId) {
          throw new Error('Latitude, longitude, and chat ID are required for sending location');
        }
        result = await sendTelegramLocation(form);
        break;

      default:
        throw new Error(`Unsupported Telegram action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Telegram node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'telegram');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'telegram';
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
        type: 'telegram',
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
    console.error('Telegram execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Telegram error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Telegram operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'telegram',
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

// Helper functions for Telegram Bot API operations
async function sendTelegramMessage(credentials: any, message: string) {
  const response = await fetch(`https://api.telegram.org/bot${credentials.botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: credentials.chatId,
      text: message,
      parse_mode: credentials.parseMode || 'Markdown'
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function sendTelegramPhoto(form: any) {
  const response = await fetch(`https://api.telegram.org/bot${form.botToken}/sendPhoto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: form.chatId,
      photo: form.photoUrl
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function sendTelegramDocument(form: any) {
  const response = await fetch(`https://api.telegram.org/bot${form.botToken}/sendDocument`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: form.chatId,
      document: form.documentUrl
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getTelegramUpdates(form: any) {
  const response = await fetch(`https://api.telegram.org/bot${form.botToken}/getUpdates`);

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }

  return await response.json();
}

async function createTelegramPoll(form: any, question: string) {
  const response = await fetch(`https://api.telegram.org/bot${form.botToken}/sendPoll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: form.chatId,
      question: question,
      options: form.pollOptions || []
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function sendTelegramLocation(form: any) {
  const response = await fetch(`https://api.telegram.org/bot${form.botToken}/sendLocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: form.chatId,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude)
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}
