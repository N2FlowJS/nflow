import { FlowRuntimeContext, NodeRegistry, NodeHandler } from './registry';
import {
  currentTimeHandler,
  chatInputHandler,
  chatOutputHandler,
  textInputHandler,
  waitHandler,
} from './standard';
import { promptTemplateHandler } from './templates';
import { llmConfigHandler, agentHandler } from './llmNodes';
import { executeToolNode, ToolRegistry } from '../tools';
import { NodeExecutionError } from './errors';

export type { FlowRuntimeContext, NodeHandler } from './registry';
export { NodeExecutionError };

// Register standard handlers
NodeRegistry.register('CurrentTime', currentTimeHandler);
NodeRegistry.register('ChatInput', chatInputHandler);
NodeRegistry.register('TextInput', textInputHandler);
NodeRegistry.register('ChatOutput', chatOutputHandler);
NodeRegistry.register('VariableComponent', textInputHandler);
NodeRegistry.register('WaitComponent', waitHandler);

// Templates
NodeRegistry.register('Prompt Template', promptTemplateHandler);

// LLM
NodeRegistry.register('ChatModelComponent', llmConfigHandler);
NodeRegistry.register('Agent', agentHandler);

export const executeNode = async (ctx: FlowRuntimeContext): Promise<unknown> => {
  const nodeType = ctx.node.data.type || '';
  const handler = NodeRegistry.getHandler(nodeType);

  if (handler) {
    return handler(ctx);
  }

  // Not handled by dedicated node handlers, check if it's a registered tool
  const toolReg = ToolRegistry.getRegistration(nodeType);
  if (toolReg) {
    const flatInput = String(Object.values(ctx.inputs).flat()[0] || '');
    
    // Resolve dynamic embedding model from inputs (pre-calculated by engine)
    const embeddingModel = ctx.inputs.embedding_model?.[0];
      
    const result = await executeToolNode(ctx.node, { query: flatInput }, { 
      toolDef: (embeddingModel ? { type: 'tool', embeddingModel } as any : undefined), 
      log: ctx.log,
      inputs: { ...ctx.inputs }
    });
    
    if (ctx.isStopped()) {
      throw new Error('Flow execution cancelled by client disconnect.');
    }
    
    // Apply automated result parsing if configured
    if (toolReg.resultParser) {
      return toolReg.resultParser(result);
    }
    
    return result;
  }

  return `Executed ${ctx.node.data.label}`;
};
