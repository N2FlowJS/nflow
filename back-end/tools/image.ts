import { ToolHandler } from './registry';
import { getNodeFieldValue } from '../utils/common';
import { runDalleImageGeneration } from '../llm/openai';

export const imageGenerationHandler: ToolHandler = async (node, args, options) => {
  const prompt = String(args.query || args.prompt || '');
  const model = String(getNodeFieldValue(node, 'model') || 'dall-e-3');
  const size = String(getNodeFieldValue(node, 'size') || '1024x1024');
  const runtimeCfg: any = {
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
