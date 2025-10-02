import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface NativeKeywordsForm extends BaseForm {
  text: string;
  language?: 'en' | 'vi' | 'auto';
  maxResults?: number;
  minLength?: number;
  removeDigits?: boolean;
  extraStopwords?: string[];
}

export type NativeKeywordsNodeData = BaseNodeData<NativeKeywordsForm> & { type: 'nativekeywords' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    NativeKeywordsNodeData: NativeKeywordsNodeData;
  }
}
