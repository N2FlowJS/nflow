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
 * Send Mail Node Definition
 * 
 * Send emails via SMTP.
 * Supports HTML/plain text, attachments, CC, BCC, and template variables.
 * 
 * Configuration:
 * - to: Recipient email address (supports {variable} templates)
 * - cc: CC recipients (optional)
 * - bcc: BCC recipients (optional)
 * - subject: Email subject (supports {variable} templates)
 * - body: Email body content (supports {variable} templates)
 * - isHtml: Send as HTML email (default: false)
 * - useSystemConfig: Use system SMTP config from env vars
 * - smtpHost: SMTP server host
 * - smtpPort: SMTP server port (default: 587)
 * - smtpSecure: Use TLS/SSL (default: true)
 * - smtpUser: SMTP username
 * - smtpPassword: SMTP password
 * 
 * Example:
 * ```json
 * {
 *   "to": "{userEmail}",
 *   "subject": "Welcome {userName}!",
 *   "body": "Hello {userName}, welcome to our platform!",
 *   "useSystemConfig": true
 * }
 * ```
 */
export const SendMailNodeDefinition: NodeDefinition = {
  id: 'sendmail',
  name: 'Send Mail',
  category: NodeCategory.API,
  description: 'Send emails via SMTP',
  version: '1.0.0',

  inputs: [
    {
      id: 'to',
      name: 'To',
      type: PortType.TEXT,
      description: 'Recipient email address (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'recipient@example.com' },
    },
    {
      id: 'subject',
      name: 'Subject',
      type: PortType.TEXT,
      description: 'Email subject (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Email subject' },
    },
    {
      id: 'body',
      name: 'Body',
      type: PortType.TEXT,
      description: 'Email body content (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'textarea', rows: 6, placeholder: 'Email content...' },
    },
    {
      id: 'cc',
      name: 'CC',
      type: PortType.TEXT,
      description: 'CC recipients (comma-separated, optional)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'cc1@example.com, cc2@example.com' },
    },
    {
      id: 'bcc',
      name: 'BCC',
      type: PortType.TEXT,
      description: 'BCC recipients (comma-separated, optional)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'bcc@example.com' },
    },
    {
      id: 'isHtml',
      name: 'HTML Email',
      type: PortType.BOOLEAN,
      description: 'Send as HTML email',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'useSystemConfig',
      name: 'Use System Config',
      type: PortType.BOOLEAN,
      description: 'Use system SMTP config from environment variables',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'smtpHost',
      name: 'SMTP Host',
      type: PortType.TEXT,
      description: 'SMTP server host',
      required: false,
      metadata: { inputType: 'text', placeholder: 'smtp.gmail.com' },
    },
    {
      id: 'smtpPort',
      name: 'SMTP Port',
      type: PortType.NUMBER,
      description: 'SMTP server port',
      required: false,
      defaultValue: 587,
      metadata: { inputType: 'number', min: 1, max: 65535 },
    },
    {
      id: 'smtpSecure',
      name: 'SMTP Secure',
      type: PortType.BOOLEAN,
      description: 'Use TLS/SSL',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'smtpUser',
      name: 'SMTP User',
      type: PortType.TEXT,
      description: 'SMTP username',
      required: false,
      metadata: { inputType: 'text', placeholder: 'your-email@example.com' },
    },
    {
      id: 'smtpPassword',
      name: 'SMTP Password',
      type: PortType.TEXT,
      description: 'SMTP password',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Your password' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Send Result',
      type: PortType.TEXT,
      description: 'Email send confirmation',
    },
    {
      id: 'messageId',
      name: 'Message ID',
      type: PortType.TEXT,
      description: 'Email message ID',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.to) {
      getInputFromTemplate(config.to as string).forEach(v => variableNames.add(v));
    }
    if (config.cc) {
      getInputFromTemplate(config.cc as string).forEach(v => variableNames.add(v));
    }
    if (config.bcc) {
      getInputFromTemplate(config.bcc as string).forEach(v => variableNames.add(v));
    }
    if (config.subject) {
      getInputFromTemplate(config.subject as string).forEach(v => variableNames.add(v));
    }
    if (config.body) {
      getInputFromTemplate(config.body as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Email parameter: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...SendMailNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.to as string) || ''),
      ...getInputFromTemplate((config.cc as string) || ''),
      ...getInputFromTemplate((config.bcc as string) || ''),
      ...getInputFromTemplate((config.subject as string) || ''),
      ...getInputFromTemplate((config.body as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: '', messageId: '' },
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

      if (!config.to || String(config.to).trim() === '') {
        throw new Error('No recipient email address specified');
      }

      if (!config.subject || String(config.subject).trim() === '') {
        throw new Error('No email subject specified');
      }

      if (!config.body || String(config.body).trim() === '') {
        throw new Error('No email body content specified');
      }

      // Process templates
      const processedTo = processTemplate(config.to as string, vars);
      const processedCc = config.cc ? processTemplate(config.cc as string, vars) : '';
      const processedBcc = config.bcc ? processTemplate(config.bcc as string, vars) : '';
      const processedSubject = processTemplate(config.subject as string, vars);
      const processedBody = processTemplate(config.body as string, vars);

      // Import nodemailer dynamically
      const nodemailer = await import('nodemailer');

      // Configure SMTP transport
      let transportConfig: any;

      if (config.useSystemConfig) {
        transportConfig = {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
              }
            : undefined
        };
      } else {
        transportConfig = {
          host: config.smtpHost as string,
          port: (config.smtpPort as number) || 587,
          secure: config.smtpSecure ?? true,
          auth: config.smtpUser
            ? {
                user: config.smtpUser as string,
                pass: config.smtpPassword as string
              }
            : undefined
        };
      }

      // Create transporter
      const transporter = nodemailer.createTransport(transportConfig);

      // Prepare email options
      const mailOptions: any = {
        from: transportConfig.auth?.user || 'noreply@localhost',
        to: processedTo,
        subject: processedSubject,
        [config.isHtml ? 'html' : 'text']: processedBody
      };

      if (processedCc) mailOptions.cc = processedCc;
      if (processedBcc) mailOptions.bcc = processedBcc;

      // Send email
      const result = await transporter.sendMail(mailOptions);

      const successMessage = `Email sent successfully to ${processedTo}. Message ID: ${result.messageId}`;

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, successMessage, 'sendmail');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: successMessage,
          messageId: result.messageId || ''
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          to: processedTo,
          subject: processedSubject
        }
      };
    } catch (error: unknown) {
      console.error('Send mail error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error';

      return {
        outputs: {
          result: '',
          messageId: ''
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
