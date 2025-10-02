// Types for Text Uppercase Node

import { BaseNodeData } from '@n2flowjs/flow';

export interface TextUppercaseForm {
  name?: string;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

export type TextUppercaseNodeData = BaseNodeData<TextUppercaseForm> & { 
  type: 'text-uppercase' 
};
