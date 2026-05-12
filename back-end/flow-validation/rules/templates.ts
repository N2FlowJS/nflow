import type { NodeValidator } from '../types';
import { validateSingleParam } from '../utils';

export const validatePromptTemplateNode: NodeValidator = (node) =>
  validateSingleParam(node, 'template', 'warning', `Prompt "${node.data.label}" has empty template.`);
