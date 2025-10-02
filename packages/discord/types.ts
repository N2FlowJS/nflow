import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DiscordForm extends BaseForm {
  name: string;
  description?: string;
  action: 'send_message' | 'create_channel' | 'get_messages' | 'send_embed' | 'manage_roles' | 'get_guild_info';
  botToken: string;
  channelId?: string;
  guildId?: string;
  message?: string;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  userId?: string;
  roleId?: string;
}

export type DiscordNodeData = BaseNodeData<DiscordForm> & { type: 'discord' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    DiscordNodeData: DiscordNodeData;
  }
}
