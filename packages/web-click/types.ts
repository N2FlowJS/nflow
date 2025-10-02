import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WebClickForm extends BaseForm {
  selector: string;
  selectorType?: 'css' | 'xpath' | 'text';
  clickType?: 'single' | 'double' | 'right';
  waitForSelector?: boolean;
  timeout?: number;
  delay?: number;
}

export type WebClickNodeData = BaseNodeData<WebClickForm> & { type: 'web-click' };

declare module '@n2flowjs/flow' {
  interface NodeDataMap { WebClickNodeData: WebClickNodeData; }
}
