import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface HttpRequestForm extends BaseForm {
  name: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  followRedirects?: boolean;
}

export type HttpRequestNodeData = BaseNodeData<HttpRequestForm> & { type: 'httprequest' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    HttpRequestNodeData: HttpRequestNodeData;
  }
}
