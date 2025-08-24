import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface HttpRequestForm extends BaseForm {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  followRedirects?: boolean;
}

export type HttpRequestNodeData = BaseNodeData<HttpRequestForm> & { type: 'httprequest' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    HttpRequestNodeData: HttpRequestNodeData;
  }
}
