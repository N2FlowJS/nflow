import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { WhatsAppNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';

/**
 * Handler for executing WhatsApp nodes
 */
export async function executeWhatsAppNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WhatsAppNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.recipientPhone || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for WhatsApp operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'whatsapp',
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
    if (!form.accessToken || !form.phoneNumberId) {
      throw new Error('WhatsApp access token and phone number ID are required');
    }

    console.log(`Executing WhatsApp node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'send_message':
        if (!form.message || !form.recipientPhone) {
          throw new Error('Message and recipient phone are required for sending messages');
        }
        const processedMessage = processTemplate(form.message, vars);
        const processedPhone = processTemplate(form.recipientPhone, vars);
        result = await sendWhatsAppMessage(form, processedMessage, processedPhone);
        break;

      case 'send_media':
        if (!form.mediaId && !form.mediaUrl) {
          throw new Error('Media ID or media URL is required for sending media');
        }
        if (!form.recipientPhone) {
          throw new Error('Recipient phone is required for sending media');
        }
        const processedRecipient = processTemplate(form.recipientPhone, vars);
        result = await sendWhatsAppMedia(form, processedRecipient);
        break;

      case 'send_template':
        if (!form.templateName || !form.recipientPhone) {
          throw new Error('Template name and recipient phone are required for sending templates');
        }
        const processedTemplateRecipient = processTemplate(form.recipientPhone, vars);
        result = await sendWhatsAppTemplate(form, processedTemplateRecipient);
        break;

      case 'get_media':
        if (!form.mediaId) {
          throw new Error('Media ID is required for getting media');
        }
        result = await getWhatsAppMedia(form, form.mediaId);
        break;

      case 'mark_read':
        if (!form.recipientPhone) {
          throw new Error('Recipient phone is required for marking messages as read');
        }
        result = await markWhatsAppRead(form);
        break;

      default:
        throw new Error(`Unsupported WhatsApp action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`WhatsApp node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'whatsapp');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'whatsapp';
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
        type: 'whatsapp',
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
    console.error('WhatsApp execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `WhatsApp operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'whatsapp',
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

// Helper functions for WhatsApp Business API operations
async function sendWhatsAppMessage(credentials: any, message: string, recipientPhone: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${credentials.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: {
        body: message
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function sendWhatsAppMedia(form: any, recipientPhone: string) {
  const mediaObject = form.mediaId ? 
    { id: form.mediaId } : 
    { link: form.mediaUrl };

  const response = await fetch(`https://graph.facebook.com/v18.0/${form.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: form.mediaType || 'image',
      [form.mediaType || 'image']: mediaObject
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function sendWhatsAppTemplate(form: any, recipientPhone: string) {
  const templateBody: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'template',
    template: {
      name: form.templateName,
      language: {
        code: form.templateLanguage || 'en_US'
      }
    }
  };

  if (form.templateParameters && form.templateParameters.length > 0) {
    templateBody.template.components = [{
      type: 'body',
      parameters: form.templateParameters.map((param: string) => ({
        type: 'text',
        text: param
      }))
    }];
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${form.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templateBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getWhatsAppMedia(form: any, mediaId: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return await response.json();
}

async function markWhatsAppRead(form: any) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${form.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: form.messageId || 'latest'
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return await response.json();
}