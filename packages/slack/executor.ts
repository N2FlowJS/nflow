import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { SlackForm } from './types';

export class SlackExecutor extends BaseApiExecutor<SlackForm> {
  constructor() {
    super({
      nodeType: 'slack',
      checkInputReadiness: true,
      templateFields: ['message', 'channelName', 'filePath'],
    });
  }

  protected async executeLogic(form: SlackForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'send_message':
        return await this.sendMessage(form, context);
      case 'create_channel':
        return await this.createChannel(form, context);
      case 'get_channels':
        return await this.getChannels(form, context);
      case 'get_users':
        return await this.getUsers(form, context);
      case 'upload_file':
        return await this.uploadFile(form, context);
      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }

  private async sendMessage(form: SlackForm, context: ExecutionContext): Promise<string> {
    const { botToken, channelId, channelName, message } = form;

    if (!channelId && !channelName) {
      throw new Error('Channel ID or channel name is required for sending messages');
    }
    if (!message) {
      throw new Error('Message content is required');
    }

    const processedMessage = this.processTemplate(message, context);
    const channel = channelId || channelName!;

    const payload = {
      channel: channel,
      text: processedMessage,
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      'https://slack.com/api/chat.postMessage',
      botToken,
      payload
    );

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return JSON.stringify(result, null, 2);
  }

  private async createChannel(form: SlackForm, context: ExecutionContext): Promise<string> {
    const { botToken, channelName } = form;

    if (!channelName) {
      throw new Error('Channel name is required for creating channels');
    }

    const processedChannelName = this.processTemplate(channelName, context);

    const payload = {
      name: processedChannelName.toLowerCase().replace(/\s+/g, '-'),
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      'https://slack.com/api/conversations.create',
      botToken,
      payload
    );

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return JSON.stringify(result, null, 2);
  }

  private async getChannels(form: SlackForm, _context: ExecutionContext): Promise<string> {
    const { botToken } = form;

    const result = await this.makeAuthenticatedRequest(
      'https://slack.com/api/conversations.list',
      botToken
    );

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return JSON.stringify(result, null, 2);
  }

  private async getUsers(form: SlackForm, _context: ExecutionContext): Promise<string> {
    const { botToken } = form;

    const result = await this.makeAuthenticatedRequest(
      'https://slack.com/api/users.list',
      botToken
    );

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return JSON.stringify(result, null, 2);
  }

  private async uploadFile(form: SlackForm, context: ExecutionContext): Promise<string> {
    const { botToken, channelId, channelName, filePath, fileName } = form;

    if (!channelId && !channelName) {
      throw new Error('Channel ID or channel name is required for file upload');
    }
    if (!filePath) {
      throw new Error('File path is required for file upload');
    }

    const processedFilePath = this.processTemplate(filePath, context);
    const channel = channelId || channelName!;

    // Note: This is a simplified version. In a real implementation, you'd need to handle file reading
    const payload = {
      channels: channel,
      filename: fileName || 'file',
      filetype: 'text',
      content: processedFilePath, // In real implementation, read file content
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      'https://slack.com/api/files.upload',
      botToken,
      payload
    );

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return JSON.stringify(result, null, 2);
  }
}