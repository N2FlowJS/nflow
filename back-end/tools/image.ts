import { type ToolHandler } from './registry';
import type { LlmRuntimeConfig } from '../llm/types';
import { getNodeFieldValue } from '../utils/common';
import { runDalleImageGeneration } from '../llm/openai';

export const imageGenerationHandler: ToolHandler = async (node, args, _options) => {
  const prompt = String(args.query || args.prompt || '');
  const model = String(getNodeFieldValue(node, 'model') || 'dall-e-3');
  const size = String(getNodeFieldValue(node, 'size') || '1024x1024');
  const runtimeCfg: LlmRuntimeConfig = {
    provider: 'OpenAI',
    model,
    apiKey: String(getNodeFieldValue(node, 'apiKey') || ''),
    baseUrl: String(getNodeFieldValue(node, 'baseUrl') || ''),
  };

  try {
    const imageUrl = await runDalleImageGeneration(runtimeCfg, prompt, { model, size });
    return imageUrl;
  } catch (e) {
    return `Error generating image: ${String(e)}`;
  }
};
