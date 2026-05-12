import { getNodeFieldValue } from '../utils/common';
import { NodeHandler, FlowRuntimeContext } from './registry';

export const currentTimeHandler: NodeHandler = async () => {
  return new Date().toLocaleString();
};

export const chatInputHandler: NodeHandler = async (ctx) => {
  return ctx.inputs.inputMessage?.[0] || ctx.inputs.response?.[0] || Object.values(ctx.inputs).flat()[0] || '';
};

export const textInputHandler: NodeHandler = async (ctx) => {
  const nodeName = ctx.node.data.type;
  if (nodeName === 'VariableComponent') {
    const name = getNodeFieldValue(ctx.node, 'variableName');
    if (name && ctx.globalVariables?.length) {
      const globalVar = ctx.globalVariables.find(v => v.name === name);
      if (globalVar) return globalVar.value;
    }
  }
  return getNodeFieldValue(ctx.node, 'value') || '';
};

export const waitHandler: NodeHandler = async (ctx) => {
  const delay = Number(getNodeFieldValue(ctx.node, 'delayMs') || 1000);
  const start = Date.now();
  // Check in 100ms intervals to allow early cancellation
  while (Date.now() - start < delay) {
    if (ctx.isStopped()) throw new Error('Wait node cancelled.');
    await new Promise((res) => setTimeout(res, 100));
  }
  return `Waited for ${delay}ms`;
};
