import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface MattermostForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_channels' | 'get_users';
  serverUrl: string;
  accessToken: string;
  channelId?: string;
  channelName?: string;
  message?: string;
  username?: string;
  teamId?: string;
}

export type MattermostNodeData = BaseNodeData<MattermostForm> & { type: 'mattermost' };
