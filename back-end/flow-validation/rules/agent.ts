import { ValidationRules } from '@n2flow/types';
import type { NodeValidator } from '../types';

export const validateAgentNode: NodeValidator = (node, context) => {
  return ValidationRules.validateAgentNode(node, context);
};
