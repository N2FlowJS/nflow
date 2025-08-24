import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface SlackForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_channels' | 'get_users' | 'upload_file';
  botToken: string;
  channelId?: string;
  channelName?: string;
  message?: string;
  username?: string;
  filePath?: string;
  fileName?: string;
}

export type SlackNodeData = BaseNodeData<SlackForm> & { type: 'slack' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    SlackNodeData: SlackNodeData;
  }
}
