import type { NodeValidator } from '../types';
import { readParamString } from '../utils';

export const validatePromptTemplateNode: NodeValidator = (node) => {
  const template = readParamString(node, 'template');
  if (template) return [];

  return [
    {
      level: 'warning',
      nodeId: node.id,
      fieldName: 'template',
      message: `Prompt "${node.data.label}" has empty template.`,
    },
  ];
};
