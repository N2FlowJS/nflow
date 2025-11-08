import { BaseApiExecutor } from '../@node-plugin/base-api-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { FacebookForm } from './types';

/**
 * Facebook Executor
 *
 * Integrates with Facebook Graph API for page management, posting, and insights.
 */
export class FacebookExecutor extends BaseApiExecutor<FacebookForm> {
  private readonly GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

  constructor() {
    super({
      nodeType: 'facebook',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['message', 'comment'],
    });
  }

  /**
   * Execute Facebook operation logic
   */
  protected async executeLogic(
    form: FacebookForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate access token
    if (!form.accessToken) {
      throw new Error('Facebook access token is required');
    }

    console.log(`Executing Facebook node with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_post':
        result = await this.createPost(form, context);
        break;

      case 'upload_photo':
        result = await this.uploadPhoto(form, context);
        break;

      case 'get_page_info':
        result = await this.getPageInfo(form);
        break;

      case 'get_posts':
        result = await this.getPosts(form);
        break;

      case 'get_page_insights':
        result = await this.getPageInsights(form);
        break;

      case 'create_comment':
        result = await this.createComment(form, context);
        break;

      default:
        throw new Error(`Unsupported Facebook action: ${form.action}`);
    }

    console.log(`Facebook operation completed`);

    return JSON.stringify(result, null, 2);
  }

  /**
   * Create a Facebook post
   */
  private async createPost(form: FacebookForm, context: ExecutionContext): Promise<any> {
    if (!form.message) {
      throw new Error('Message is required for creating posts');
    }

    const processedMessage = this.processTemplate(form.message, context);
    const endpoint = form.pageId ? `${form.pageId}/feed` : 'me/feed';
    const url = `${this.GRAPH_API_BASE}/${endpoint}`;

    const postData = {
      message: processedMessage,
      link: form.link,
      access_token: form.accessToken,
      ...(form.scheduled && form.scheduledTime && {
        scheduled_publish_time: Math.floor(new Date(form.scheduledTime).getTime() / 1000),
        published: false,
      }),
    };

    return this.makeJsonPostRequest(url, postData);
  }

  /**
   * Upload a photo to Facebook
   */
  private async uploadPhoto(form: FacebookForm, context: ExecutionContext): Promise<any> {
    if (!form.message || !form.photoUrl) {
      throw new Error('Message and photo URL are required for uploading photos');
    }

    const processedMessage = this.processTemplate(form.message, context);
    const endpoint = form.pageId ? `${form.pageId}/photos` : 'me/photos';
    const url = `${this.GRAPH_API_BASE}/${endpoint}`;

    const photoData = {
      message: processedMessage,
      url: form.photoUrl,
      access_token: form.accessToken,
      ...(form.scheduled && form.scheduledTime && {
        scheduled_publish_time: Math.floor(new Date(form.scheduledTime).getTime() / 1000),
        published: false,
      }),
    };

    return this.makeJsonPostRequest(url, photoData);
  }

  /**
   * Get Facebook page information
   */
  private async getPageInfo(form: FacebookForm): Promise<any> {
    const endpoint = form.pageId || 'me';
    const url = `${this.GRAPH_API_BASE}/${endpoint}?fields=id,name,about,category,followers_count,fan_count&access_token=${form.accessToken}`;

    return this.makeHttpRequest(url);
  }

  /**
   * Get Facebook posts
   */
  private async getPosts(form: FacebookForm): Promise<any> {
    const endpoint = form.pageId ? `${form.pageId}/posts` : 'me/posts';
    const url = `${this.GRAPH_API_BASE}/${endpoint}?fields=id,message,created_time,likes.summary(true),comments.summary(true)&limit=25&access_token=${form.accessToken}`;

    return this.makeHttpRequest(url);
  }

  /**
   * Get Facebook page insights
   */
  private async getPageInsights(form: FacebookForm): Promise<any> {
    if (!form.pageId) {
      throw new Error('Page ID is required for insights');
    }

    const url = `${this.GRAPH_API_BASE}/${form.pageId}/insights?metric=page_impressions,page_reach,page_fans&period=day&access_token=${form.accessToken}`;

    return this.makeHttpRequest(url);
  }

  /**
   * Create a comment on a Facebook post
   */
  private async createComment(form: FacebookForm, context: ExecutionContext): Promise<any> {
    if (!form.postId || !form.comment) {
      throw new Error('Post ID and comment are required for adding comments');
    }

    const processedComment = this.processTemplate(form.comment, context);
    const url = `${this.GRAPH_API_BASE}/${form.postId}/comments`;

    const commentData = {
      message: processedComment,
      access_token: form.accessToken,
    };

    return this.makeJsonPostRequest(url, commentData);
  }
}

// Export singleton instance
export const facebookExecutor = new FacebookExecutor();
