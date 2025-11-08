import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { TelegramForm } from './types';

export class TelegramExecutor extends BaseApiExecutor<TelegramForm> {
  constructor() {
    super({
      nodeType: 'telegram',
      checkInputReadiness: true,
      templateFields: ['message', 'pollQuestion'],
    });
  }

  protected async executeLogic(form: TelegramForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'send_message':
        return await this.sendMessage(form, context);
      case 'send_photo':
        return await this.sendPhoto(form, context);
      case 'send_document':
        return await this.sendDocument(form, context);
      case 'get_updates':
        return await this.getUpdates(form, context);
      case 'create_poll':
        return await this.createPoll(form, context);
      case 'send_location':
        return await this.sendLocation(form, context);
      default:
        throw new Error(`Unsupported Telegram action: ${action}`);
    }
  }

  private async sendMessage(form: TelegramForm, context: ExecutionContext): Promise<string> {
    const { message, chatId, botToken } = form;

    if (!message || !chatId) {
      throw new Error('Message and chat ID are required for sending messages');
    }

    const processedMessage = this.processTemplate(message, context);

    const payload = {
      chat_id: chatId,
      text: processedMessage,
      parse_mode: 'Markdown',
    };

    const result = await this.makeJsonPostRequest(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async sendPhoto(form: TelegramForm, _context: ExecutionContext): Promise<string> {
    const { photoUrl, chatId, botToken } = form;

    if (!photoUrl || !chatId) {
      throw new Error('Photo URL and chat ID are required for sending photos');
    }

    const payload = {
      chat_id: chatId,
      photo: photoUrl,
    };

    const result = await this.makeJsonPostRequest(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async sendDocument(form: TelegramForm, _context: ExecutionContext): Promise<string> {
    const { documentUrl, chatId, botToken } = form;

    if (!documentUrl || !chatId) {
      throw new Error('Document URL and chat ID are required for sending documents');
    }

    const payload = {
      chat_id: chatId,
      document: documentUrl,
    };

    const result = await this.makeJsonPostRequest(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async getUpdates(form: TelegramForm, _context: ExecutionContext): Promise<string> {
    const { botToken } = form;

    const result = await this.makeHttpRequest(
      `https://api.telegram.org/bot${botToken}/getUpdates`
    );

    return JSON.stringify(result, null, 2);
  }

  private async createPoll(form: TelegramForm, context: ExecutionContext): Promise<string> {
    const { pollQuestion, pollOptions, chatId, botToken } = form;

    if (!pollQuestion || !pollOptions || !chatId) {
      throw new Error('Poll question, options, and chat ID are required for creating polls');
    }

    const processedQuestion = this.processTemplate(pollQuestion, context);

    const payload = {
      chat_id: chatId,
      question: processedQuestion,
      options: pollOptions,
    };

    const result = await this.makeJsonPostRequest(
      `https://api.telegram.org/bot${botToken}/sendPoll`,
      payload
    );

    return JSON.stringify(result, null, 2);
  }

  private async sendLocation(form: TelegramForm, _context: ExecutionContext): Promise<string> {
    const { latitude, longitude, chatId, botToken } = form;

    if (!latitude || !longitude || !chatId) {
      throw new Error('Latitude, longitude, and chat ID are required for sending location');
    }

    const payload = {
      chat_id: chatId,
      latitude: parseFloat(latitude.toString()),
      longitude: parseFloat(longitude.toString()),
    };

    const result = await this.makeJsonPostRequest(
      `https://api.telegram.org/bot${botToken}/sendLocation`,
      payload
    );

    return JSON.stringify(result, null, 2);
  }
}