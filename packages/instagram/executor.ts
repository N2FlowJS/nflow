import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { InstagramForm } from './types';

export class InstagramExecutor extends BaseApiExecutor<InstagramForm> {
  constructor() {
    super({
      nodeType: 'instagram',
      checkInputReadiness: true,
      templateFields: ['caption', 'mediaUrl'],
    });
  }

  protected async executeLogic(form: InstagramForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'create_post':
        return await this.createPost(form, context);
      case 'get_user_info':
        return await this.getUserInfo(form, context);
      case 'get_media':
        return await this.getMedia(form, context);
      default:
        throw new Error(`Unsupported Instagram action: ${action}`);
    }
  }

  private async createPost(form: InstagramForm, context: ExecutionContext): Promise<string> {
    const { caption, mediaUrl, userId, accessToken } = form;

    if (!mediaUrl) {
      throw new Error('Media URL is required for creating posts');
    }

    const processedCaption = caption ? this.processTemplate(caption, context) : '';
    const processedMediaUrl = this.processTemplate(mediaUrl, context);

    // Step 1: Upload media
    const mediaPayload = {
      image_url: processedMediaUrl,
      caption: processedCaption,
      access_token: accessToken,
    };

    const mediaResult = await this.makeJsonPostRequest(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      mediaPayload
    );

    const mediaId = mediaResult.id;

    // Step 2: Publish media
    const publishPayload = {
      creation_id: mediaId,
      access_token: accessToken,
    };

    const publishResult = await this.makeJsonPostRequest(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      publishPayload
    );

    return JSON.stringify(publishResult, null, 2);
  }

  private async getUserInfo(form: InstagramForm, _context: ExecutionContext): Promise<string> {
    const { userId = 'me', accessToken } = form;

    const url = new URL(`https://graph.facebook.com/v18.0/${userId}`);
    url.searchParams.append('fields', 'id,username,account_type,media_count,followers_count');
    url.searchParams.append('access_token', accessToken);

    const result = await this.makeHttpRequest(url.toString());
    return JSON.stringify(result, null, 2);
  }

  private async getMedia(form: InstagramForm, _context: ExecutionContext): Promise<string> {
    const { userId, accessToken } = form;

    if (!userId) {
      throw new Error('User ID is required for getting media');
    }

    const url = new URL(`https://graph.facebook.com/v18.0/${userId}/media`);
    url.searchParams.append('fields', 'id,media_type,media_url,thumbnail_url,timestamp');
    url.searchParams.append('access_token', accessToken);

    const result = await this.makeHttpRequest(url.toString());
    return JSON.stringify(result, null, 2);
  }
}