import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface TelegramForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_photo' | 'send_document' | 'get_updates' | 'create_poll' | 'send_location';
  botToken: string;
  chatId?: string;
  message?: string;
  photoUrl?: string;
  documentUrl?: string;
  pollQuestion?: string;
  pollOptions?: string[];
  latitude?: number;
  longitude?: number;
  caption?: string;
}

export type TelegramNodeData = BaseNodeData<TelegramForm> & { type: 'telegram' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    TelegramNodeData: TelegramNodeData;
  }
}
