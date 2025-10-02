import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WebTypingForm extends BaseForm {
  selector: string;
  selectorType?: 'css' | 'xpath' | 'text';
  text: string;
  clearBefore?: boolean;
  pressEnter?: boolean;
  typingDelay?: number;
  waitForSelector?: boolean;
  timeout?: number;
}

export type WebTypingNodeData = BaseNodeData<WebTypingForm> & { type: 'web-typing' };

declare module '@n2flowjs/flow' {
  interface NodeDataMap { WebTypingNodeData: WebTypingNodeData; }
}
