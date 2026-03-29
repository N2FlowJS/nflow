import { getNodeFieldValue } from '../utils/common';
import { NodeHandler } from './registry';
import { runChat } from '../llm';
import { NodeExecutionError } from './errors';

export const llmConfigHandler: NodeHandler = async (ctx) => {
  const node = ctx.node;
  return {
    kind: 'llm_chat',
    provider:
      getNodeFieldValue(node, 'provider') ||
      (node.data.type.includes('Ollama')
        ? 'Ollama'
        : node.data.type.includes('VLLM')
          ? 'vLLM'
          : 'Google'),
    model: getNodeFieldValue(node, 'model') || 'gemini-2.0-flash',
    apiKey: getNodeFieldValue(node, 'apiKey') || '',
    baseUrl: getNodeFieldValue(node, 'baseUrl') || '',
    temperature: Number(
      getNodeFieldValue(node, 'temperature') ??
        getNodeFieldValue(node, 'temp') ??
        0.7,
    ),
    max_tokens: Number(getNodeFieldValue(node, 'max_tokens') || 2048),
    top_p: Number(getNodeFieldValue(node, 'top_p') || 0.95),
    top_k: Number(getNodeFieldValue(node, 'top_k') || 40),
    presence_penalty: Number(
      getNodeFieldValue(node, 'presence_penalty') || 0,
    ),
    frequency_penalty: Number(
      getNodeFieldValue(node, 'frequency_penalty') || 0,
    ),
  };
};

export { NodeExecutionError };

export const agentHandler: NodeHandler = async (ctx) => {
  const node = ctx.node;
  const nodeInstruction = String(getNodeFieldValue(node, 'instruction') || '').trim();
  const linkedSystemPrompt = String(ctx.inputs.system_prompt?.[0] || '').trim();
  const systemPrompt = [nodeInstruction, linkedSystemPrompt].filter(Boolean).join('\n\n');
  const userPrompt = String(ctx.inputs.input_value?.[0] || '');

  const llmCfg = (ctx.inputs.agent_llm?.[0] as Record<string, unknown> | undefined) || {
    provider: 'Google',
    model: 'gemini-2.0-flash',
    kind: 'llm_chat',
  };
  
  if (llmCfg?.kind === 'llm_embedding') {
    throw new Error('Agent only supports chat model.');
  }

  const incomingForNode = ctx.incomingMap.get(node.id) || [];
  const llmEdge = incomingForNode.find((e: any) => e.targetHandle === 'agent_llm');
  const llmNodeId = llmEdge?.source;
  const llmNode = llmNodeId ? ctx.nodeById.get(llmNodeId) : undefined;

  const runtimeCfg = {
    provider: String(llmCfg?.provider || 'Google'),
    model: String(llmCfg?.model || 'gemini-2.0-flash'),
    apiKey: String(llmCfg?.apiKey || ''),
    baseUrl: String(llmCfg?.baseUrl || ''),
    temperature: llmCfg?.temperature as number | undefined,
    max_tokens: llmCfg?.max_tokens as number | undefined,
    top_p: llmCfg?.top_p as number | undefined,
    top_k: llmCfg?.top_k as number | undefined,
  };

  const executeToolByNameWithContext = async (name: string, callArgs: Record<string, string>) => {
    const toolResult = await ctx.executeToolByName(name, callArgs);
    const normalizedToolResult = String(toolResult || '').trim();

    if (/^error\b/i.test(normalizedToolResult)) {
      const toolDef = ctx.availableTools.find((t) => t.name === name);
      const toolNode = toolDef ? ctx.nodeById.get(String(toolDef.nodeId || '')) : undefined;
      
      const relatedNodeIds: string[] = [];
      if (toolNode) {
        relatedNodeIds.push(toolNode.id);
        const incomingForTool = ctx.incomingMap.get(toolNode.id) || [];
        const embeddingEdge = incomingForTool.find((e: any) => e.targetHandle === 'embedding_model');
        if (embeddingEdge?.source) relatedNodeIds.push(embeddingEdge.source);
      }

      const sourceLabel = toolNode?.data?.label || toolNode?.data?.type || 'Tool node';
      throw new NodeExecutionError(`${sourceLabel} failed: ${normalizedToolResult}`, relatedNodeIds);
    }

    return toolResult;
  };

  try {
    return await runChat(runtimeCfg, systemPrompt, userPrompt, ctx.availableTools, executeToolByNameWithContext, ctx.log);
  } catch (err) {
    if (err instanceof NodeExecutionError) throw err;
    const rawMessage = err instanceof Error ? err.message : String(err);
    const llmLabel = llmNode?.data?.label || (llmNode && llmNode.data?.type) || 'LLM node';
    throw new NodeExecutionError(`LLM "${llmLabel}" failed: ${rawMessage}`, llmNodeId ? [llmNodeId] : []);
  }
};
