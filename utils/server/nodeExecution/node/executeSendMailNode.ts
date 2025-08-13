import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { SendMailNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';

/**
 * Handler for executing Send Mail nodes
 */
export async function executeSendMailNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as SendMailNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from all email fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.to || ''),
    ...getInputFromTemplate(form.cc || ''),
    ...getInputFromTemplate(form.bcc || ''),
    ...getInputFromTemplate(form.subject || ''),
    ...getInputFromTemplate(form.body || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for email',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'sendmail',
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
    if (!form.to || form.to.trim() === '') {
      throw new Error('No recipient email address specified');
    }

    if (!form.subject || form.subject.trim() === '') {
      throw new Error('No email subject specified');
    }

    if (!form.body || form.body.trim() === '') {
      throw new Error('No email body content specified');
    }

    // Process templates with variables
    const processedTo = processTemplate(form.to, vars);
    const processedCc = form.cc ? processTemplate(form.cc, vars) : '';
    const processedBcc = form.bcc ? processTemplate(form.bcc, vars) : '';
    const processedSubject = processTemplate(form.subject, vars);
    const processedBody = processTemplate(form.body, vars);
    
    console.log(`Sending email to: ${processedTo}, subject: ${processedSubject}`);

    // Import nodemailer dynamically to avoid bundling issues
    const nodemailer = await import('nodemailer');
    
    // Configure SMTP transport
    let transportConfig: any;
    
    if (form.useSystemConfig) {
      // Use system configuration from environment variables
      transportConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        } : undefined,
      };
    } else {
      // Use custom configuration from form
      transportConfig = {
        host: form.smtpHost,
        port: form.smtpPort || 587,
        secure: form.smtpSecure ?? true,
        auth: form.smtpUser ? {
          user: form.smtpUser,
          pass: form.smtpPassword,
        } : undefined,
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport(transportConfig);

    // Prepare email options
    const mailOptions: any = {
      from: transportConfig.auth?.user || 'noreply@localhost',
      to: processedTo,
      subject: processedSubject,
      [form.isHtml ? 'html' : 'text']: processedBody,
    };

    if (processedCc) mailOptions.cc = processedCc;
    if (processedBcc) mailOptions.bcc = processedBcc;

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    const successMessage = `Email sent successfully to ${processedTo}. Message ID: ${result.messageId}`;
    console.log(successMessage);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, successMessage, 'sendmail');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = successMessage;
      flowState.components[node.id]['type'] = 'sendmail';
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
        type: 'sendmail',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: successMessage,
      },
    };
  } catch (error: unknown) {
    console.error('Email sending error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Email sending failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'sendmail',
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
