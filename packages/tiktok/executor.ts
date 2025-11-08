import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { TikTokForm } from './types';

export class TikTokExecutor extends BaseApiExecutor<TikTokForm> {
  constructor() {
    super({
      nodeType: 'tiktok',
      checkInputReadiness: true,
      templateFields: ['caption', 'hashtag'],
    });
  }

  protected async executeLogic(form: TikTokForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'upload_video':
        return await this.uploadVideo(form, context);
      case 'get_user_info':
        return await this.getUserInfo(form, context);
      case 'get_videos':
        return await this.getVideos(form, context);
      case 'get_hashtag_videos':
        return await this.getHashtagVideos(form, context);
      default:
        throw new Error(`Unsupported TikTok action: ${action}`);
    }
  }

  private async uploadVideo(form: TikTokForm, context: ExecutionContext): Promise<string> {
    const { videoFile, caption, hashtags = [], privacy = 'public' } = form;

    if (!videoFile) {
      throw new Error('Video file is required for uploading videos');
    }

    const processedCaption = caption ? this.processTemplate(caption, context) : '';

    // Mock implementation - replace with actual TikTok for Developers API
    const result = {
      video_id: 'mock_video_id',
      caption: processedCaption,
      hashtags: hashtags,
      privacy_status: privacy,
      created_time: Math.floor(Date.now() / 1000),
      share_url: 'https://tiktok.com/@user/video/mock_video_id'
    };

    return JSON.stringify(result, null, 2);
  }

  private async getUserInfo(form: TikTokForm, _context: ExecutionContext): Promise<string> {
    const { userId } = form;

    if (!userId) {
      throw new Error('User ID is required for getting user info');
    }

    // Mock implementation
    const result = {
      user_id: userId,
      username: 'sample_user',
      display_name: 'Sample User',
      bio_description: 'Sample bio',
      follower_count: 1000,
      following_count: 500,
      likes_count: 10000,
      video_count: 50
    };

    return JSON.stringify(result, null, 2);
  }

  private async getVideos(_form: TikTokForm, _context: ExecutionContext): Promise<string> {
    // Mock implementation
    const result = {
      videos: [
        {
          video_id: 'mock_video_1',
          title: 'Sample Video',
          view_count: 1000,
          like_count: 100,
          comment_count: 50,
          share_count: 25,
          create_time: Math.floor(Date.now() / 1000)
        }
      ],
      cursor: 'next_page_token',
      has_more: false
    };

    return JSON.stringify(result, null, 2);
  }

  private async getHashtagVideos(form: TikTokForm, context: ExecutionContext): Promise<string> {
    const { hashtag } = form;

    if (!hashtag) {
      throw new Error('Hashtag is required for getting hashtag videos');
    }

    const processedHashtag = this.processTemplate(hashtag, context);

    // Mock implementation
    const result = {
      videos: [
        {
          video_id: 'mock_hashtag_video_1',
          title: `Video with ${processedHashtag}`,
          view_count: 5000,
          like_count: 500,
          hashtag: processedHashtag,
          create_time: Math.floor(Date.now() / 1000)
        }
      ],
      cursor: 'next_page_token',
      has_more: true
    };

    return JSON.stringify(result, null, 2);
  }
}