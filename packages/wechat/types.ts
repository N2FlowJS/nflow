import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface WeChatForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'send_template' | 'get_user_info' | 'create_menu' | 'get_qr_code' | 'send_mini_program';
  appId: string;
  appSecret: string;
  accessToken?: string;
  openId?: string;
  templateId?: string;
  message?: string;
  mediaId?: string;
  menuData?: string;
  scene?: string;
  miniProgramAppId?: string;
  miniProgramPath?: string;
}

export type WeChatNodeData = BaseNodeData<WeChatForm> & { type: 'wechat' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    WeChatNodeData: WeChatNodeData;
  }
}
