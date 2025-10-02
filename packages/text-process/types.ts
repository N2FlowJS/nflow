import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface TextProcessForm extends BaseForm {
  name: string;
  description?: string;
  inputText: string;
  operation: 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'split' | 'join' | 'regex' | 'length';
  searchValue?: string;
  replaceValue?: string;
  separator?: string;
  regexPattern?: string;
  regexFlags?: string;
}

export type TextProcessNodeData = BaseNodeData<TextProcessForm> & { type: 'textprocess' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    TextProcessNodeData: TextProcessNodeData;
  }
}
