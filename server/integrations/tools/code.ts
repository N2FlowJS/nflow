import { Script, createContext } from 'node:vm';
import { ToolHandler, ExecutionOptions } from './registry';
import { getNodeFieldValue, serializeToolResult } from '../../utils/common';

const executeJsTool = (code: string, input: string, args: Record<string, string>, options: ExecutionOptions): string => {
  if (!code.trim()) {
    return 'Error: JavaScript code is empty. Set the "code" parameter in JS Code node.';
  }

  const { log } = options;

  const sandbox: Record<string, unknown> = {
    input,
    args,
    output: undefined,
    JSON,
    Math,
    Date,
    console: {
      log: (...msg: any[]) => {
        const formatted = msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' ');
        log(`[JS:Log] ${formatted}`);
      },
      error: (...msg: any[]) => {
        const formatted = msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' ');
        log(`[JS:Error] ${formatted}`);
      },
      warn: (...msg: any[]) => {
        const formatted = msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' ');
        log(`[JS:Warn] ${formatted}`);
      }
    }
  };

  const context = createContext(sandbox);
  // We wrap user code into an IIFE so the execution happens INSIDE runInContext,
  // structurally guaranteeing the 1500ms timeout boundary applies to infinite loops.
  const wrapped = `
(function(input, args, console){
${code}
})(input, args, console);`;

  try {
    const script = new Script(wrapped);
    const result = script.runInContext(context, { timeout: 1500 });
    const finalResult = result === undefined ? sandbox.output : result;
    return serializeToolResult(finalResult);
  } catch (err) {
    return `Error executing JS code: ${String(err)}`;
  }
};

export const codeExecutionHandler: ToolHandler = async (node, args, options) => {
  const code = String(getNodeFieldValue(node, 'code') || '');
  const input = String(args.query || args.input || '');
  return executeJsTool(code, input, args, options);
};
