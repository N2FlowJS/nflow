import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { SendMailForm } from './types';

export class SendMailExecutor extends BaseNodeExecutor<SendMailForm> {
  constructor() {
    super({
      nodeType: 'sendmail',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['to', 'cc', 'bcc', 'subject', 'body'],
    });
  }

  protected async executeLogic(form: SendMailForm, context: ExecutionContext): Promise<string> {
    const { to, cc, bcc, subject, body, isHtml, useSystemConfig, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword } = form;

    // Validate required fields
    if (!to || to.trim() === '') {
      throw new Error('No recipient email address specified');
    }

    if (!subject || subject.trim() === '') {
      throw new Error('No email subject specified');
    }

    if (!body || body.trim() === '') {
      throw new Error('No email body content specified');
    }

    // Process templates
    const processedTo = this.processTemplate(to, context);
    const processedCc = cc ? this.processTemplate(cc, context) : '';
    const processedBcc = bcc ? this.processTemplate(bcc, context) : '';
    const processedSubject = this.processTemplate(subject, context);
    const processedBody = this.processTemplate(body, context);

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');

    // Configure SMTP transport
    let transportConfig: any;

    if (useSystemConfig) {
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
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpSecure ?? true,
        auth: smtpUser
          ? {
              user: smtpUser,
              pass: smtpPassword
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
      [isHtml ? 'html' : 'text']: processedBody
    };

    if (processedCc) mailOptions.cc = processedCc;
    if (processedBcc) mailOptions.bcc = processedBcc;

    // Send email
    const result = await transporter.sendMail(mailOptions);

    const successMessage = `Email sent successfully to ${processedTo}. Message ID: ${result.messageId}`;

    // Return structured result
    return JSON.stringify({
      result: successMessage,
      messageId: result.messageId || '',
      metadata: {
        to: processedTo,
        subject: processedSubject,
        smtpHost: transportConfig.host,
        smtpPort: transportConfig.port
      }
    });
  }
}

export const sendMailExecutor = new SendMailExecutor();
