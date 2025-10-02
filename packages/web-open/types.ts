import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WebOpenForm extends BaseForm {
  url: string;
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

export type WebOpenNodeData = BaseNodeData<WebOpenForm> & { type: 'web-open' };

declare module '@n2flowjs/flow' {
  interface NodeDataMap { WebOpenNodeData: WebOpenNodeData; }
}
