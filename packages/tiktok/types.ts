import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface TikTokForm extends BaseForm {
  name: string;
  description?: string;
  action: 'upload_video' | 'get_user_info' | 'get_videos' | 'get_hashtag_videos';
  accessToken: string;
  videoFile?: string;
  caption?: string;
  hashtags?: string[];
  userId?: string;
  hashtag?: string;
  maxResults?: number;
  privacy?: 'public' | 'friends' | 'private';
}

export type TikTokNodeData = BaseNodeData<TikTokForm> & { type: 'tiktok' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    TikTokNodeData: TikTokNodeData;
  }
}
