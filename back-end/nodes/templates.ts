import { getNodeFieldValue } from '../utils/common';
import { NodeHandler } from './registry';

export const promptTemplateHandler: NodeHandler = async (ctx) => {
  let tpl = String(getNodeFieldValue(ctx.node, 'template') || '');
  tpl = tpl.replace(
    /\{\s*([a-zA-Z0-9_]+)\s*\}/g,
    (_m, variableName) => {
      const val = ctx.inputs[variableName]?.[0];
      if (val === undefined || val === null) return `{${variableName}}`;
      return typeof val === 'string' ? val : JSON.stringify(val);
    },
  );
  return tpl;
};
