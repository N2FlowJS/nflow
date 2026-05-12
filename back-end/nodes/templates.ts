import { getNodeFieldValue, interpolate } from '../utils/common';
import { NodeHandler } from './registry';

export const promptTemplateHandler: NodeHandler = async (ctx) => {
  const tpl = String(getNodeFieldValue(ctx.node, 'template') || '');
  
  // Convert ctx.inputs to a flat map of strings for interpolate
  const values: Record<string, string> = {};
  for (const [key, valArray] of Object.entries(ctx.inputs)) {
    const val = valArray?.[0];
    if (val !== undefined && val !== null) {
      values[key] = typeof val === 'string' ? val : JSON.stringify(val);
    }
  }

  return interpolate(tpl, values);
};
