import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface FacebookForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_page_info' | 'get_posts' | 'create_comment' | 'get_page_insights' | 'upload_photo';
  accessToken: string;
  pageId?: string;
  postId?: string;
  message?: string;
  photoUrl?: string;
  comment?: string;
  link?: string;
  scheduled?: boolean;
  scheduledTime?: string;
}

export type FacebookNodeData = BaseNodeData<FacebookForm> & { type: 'facebook' };
