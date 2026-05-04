import { Script, createContext } from 'node:vm';
import { ToolHandler } from './registry';
import { getNodeFieldValue, parseJsonSafely } from '../utils/common';

export const conditionHandler: ToolHandler = async (node, args) => {
  const condition = String(getNodeFieldValue(node, 'condition') || '').trim();
  if (!condition) {
    return 'Error: Condition is empty. Set "condition" in Router node.';
  }

  const query = String(args.query || args.input || '');
  const sandbox = Object.create(null);
  Object.assign(sandbox, {
    input: query,
    query,
    args,
    JSON,
    Math,
    Date,
  });

  try {
    const context = createContext(sandbox);
    const script = new Script(`Boolean(${condition})`);
    const value = script.runInContext(context, { timeout: 500 });
    return String(Boolean(value));
  } catch (err) {
    return `Error evaluating condition: ${String(err)}`;
  }
};

export const jsonParserHandler: ToolHandler = async (node, args) => {
  const raw = String(args.query || args.json || args.input || '');
  if (!raw.trim()) {
    return 'Error: JSON input is empty. Provide JSON text in tool args.query.';
  }

  const parsed = parseJsonSafely(raw);
  if (parsed === undefined) {
    return 'Error: Invalid JSON input.';
  }

  return JSON.stringify(parsed);
};

export const dataStreamHandler: ToolHandler = async (node, args) => {
  const streamType = String(getNodeFieldValue(node, 'streamType') || 'Metrics Array');
  if (streamType === 'Single Value') {
    const value = Number.parseFloat(String(args.query || ''));
    return Number.isFinite(value)
      ? String(value)
      : String(Math.round((50 + Math.random() * 50) * 100) / 100);
  }

  const samples = Array.from({ length: 10 }, (_, idx) => ({
    name: `P${idx + 1}`,
    value: Math.round((20 + Math.random() * 80) * 100) / 100,
  }));
  return JSON.stringify(samples);
};
