import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface KeywordsForm extends BaseForm {
  model: string;
  prompt: string;
  maxResults: number;
  numberHistory: number;
}

export type KeywordsNodeData = BaseNodeData<KeywordsForm> & { type: 'keywords' };
