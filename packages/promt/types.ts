import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface TemplateForm extends BaseForm {
  name: string;
  description?: string;
  templateEngine: 'handlebars' | 'mustache' | 'simple';
  templateContent: string;
  outputFormat: 'text' | 'html' | 'json';
}

export type TemplateNodeData = BaseNodeData<TemplateForm> & { type: 'promt' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    TemplateNodeData: TemplateNodeData;
  }
}
