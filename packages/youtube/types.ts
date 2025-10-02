import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface YouTubeForm extends BaseForm {
  name: string;
  description?: string;
  action: 'upload_video' | 'get_videos' | 'get_channel_info' | 'create_playlist' | 'get_comments' | 'get_analytics';
  apiKey: string;
  videoFile?: string;
  title?: string;
  videoDescription?: string;
  tags?: string[];
  categoryId?: string;
  privacy?: 'public' | 'private' | 'unlisted';
  channelId?: string;
  videoId?: string;
  playlistTitle?: string;
}

export type YouTubeNodeData = BaseNodeData<YouTubeForm> & { type: 'youtube' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    YouTubeNodeData: YouTubeNodeData;
  }
}
