import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface TwitterForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_tweet' | 'get_tweets' | 'get_user_info' | 'follow_user' | 'like_tweet' | 'retweet' | 'get_mentions';
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  tweetText?: string;
  userId?: string;
  username?: string;
  tweetId?: string;
  query?: string;
  maxResults?: number;
}

export type TwitterNodeData = BaseNodeData<TwitterForm> & { type: 'twitter' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    TwitterNodeData: TwitterNodeData;
  }
}
