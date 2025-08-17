import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface InstagramForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_user_info' | 'get_media' | 'get_comments' | 'like_media' | 'get_hashtag_media';
  accessToken: string;
  userId?: string;
  username?: string;
  mediaId?: string;
  caption?: string;
  mediaUrl?: string;
  hashtag?: string;
  maxResults?: number;
}

export type InstagramNodeData = BaseNodeData<InstagramForm> & { type: 'instagram' };
