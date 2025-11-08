import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { WhatsAppForm } from './types';

export class WhatsAppExecutor extends BaseApiExecutor<WhatsAppForm> {
  constructor() {
    super({
      nodeType: 'whatsapp',
      checkInputReadiness: true,
      templateFields: ['message', 'recipientPhone'],
    });
  }

  protected async executeLogic(form: WhatsAppForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'send_message':
        return await this.sendMessage(form, context);
      case 'send_media':
        return await this.sendMedia(form, context);
      case 'send_template':
        return await this.sendTemplate(form, context);
      case 'get_media':
        return await this.getMedia(form, context);
      case 'mark_read':
        return await this.markRead(form, context);
      default:
        throw new Error(`Unsupported WhatsApp action: ${action}`);
    }
  }

  private async sendMessage(form: WhatsAppForm, context: ExecutionContext): Promise<string> {
    const { message, recipientPhone, accessToken, phoneNumberId } = form;

    if (!message || !recipientPhone) {
      throw new Error('Message and recipient phone are required for sending messages');
    }

    const processedMessage = this.processTemplate(message, context);
    const processedPhone = this.processTemplate(recipientPhone, context);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: processedPhone,
      type: 'text',
      text: {
        body: processedMessage
      }
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      accessToken,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async sendMedia(form: WhatsAppForm, context: ExecutionContext): Promise<string> {
    const { recipientPhone, mediaId, mediaUrl, mediaType = 'image', accessToken, phoneNumberId } = form;

    if (!recipientPhone) {
      throw new Error('Recipient phone is required for sending media');
    }

    if (!mediaId && !mediaUrl) {
      throw new Error('Media ID or media URL is required for sending media');
    }

    const processedPhone = this.processTemplate(recipientPhone, context);
    const mediaObject = mediaId ? { id: mediaId } : { link: mediaUrl };

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: processedPhone,
      type: mediaType,
      [mediaType]: mediaObject
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      accessToken,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async sendTemplate(form: WhatsAppForm, context: ExecutionContext): Promise<string> {
    const { recipientPhone, templateName, templateLanguage = 'en_US', templateParameters, accessToken, phoneNumberId } = form;

    if (!recipientPhone || !templateName) {
      throw new Error('Recipient phone and template name are required for sending templates');
    }

    const processedPhone = this.processTemplate(recipientPhone, context);

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: processedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLanguage
        }
      }
    };

    if (templateParameters && templateParameters.length > 0) {
      payload.template.components = [{
        type: 'body',
        parameters: templateParameters.map((param: string) => ({
          type: 'text',
          text: param
        }))
      }];
    }

    const result = await this.makeAuthenticatedJsonPostRequest(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      accessToken,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async getMedia(form: WhatsAppForm, _context: ExecutionContext): Promise<string> {
    const { mediaId, accessToken } = form;

    if (!mediaId) {
      throw new Error('Media ID is required for getting media');
    }

    const result = await this.makeAuthenticatedRequest(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      accessToken
    );

    return JSON.stringify(result, null, 2);
  }

  private async markRead(form: WhatsAppForm, _context: ExecutionContext): Promise<string> {
    const { recipientPhone, accessToken, phoneNumberId } = form;

    if (!recipientPhone) {
      throw new Error('Recipient phone is required for marking messages as read');
    }

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: 'latest'
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      accessToken,
      payload
    );

    return JSON.stringify(result, null, 2);
  }
}