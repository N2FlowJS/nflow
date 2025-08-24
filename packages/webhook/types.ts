import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WebhookForm extends BaseForm {
  name: string;
  description?: string;
  webhookUrl: string;
  method: 'GET' | 'POST' | 'PUT';
  payload: string;
  headers?: { [key: string]: string };
  retryCount?: number;
}

export type WebhookNodeData = BaseNodeData<WebhookForm> & { type: 'webhook' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    WebhookNodeData: WebhookNodeData;
  }
}
