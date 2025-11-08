import { NodeCategory, NodeDefinition } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { RewriteExecutor } from './executor';

export const RewriteNode: NodeDefinition = {
  id: 'rewrite',
  name: 'Rewrite (AI)',
  category: NodeCategory.AI,
  description: 'Rewrites text using AI models (OpenAI, Gemini, etc.)',
  version: '1.0.0',
  inputs: [
    {
      id: 'text',
      name: 'text',
      type: PortType.TEXT,
      description: 'Text to rewrite',
    },
  ],
  outputs: [
    {
      id: 'rewrittenText',
      name: 'rewrittenText',
      type: PortType.TEXT,
      description: 'Rewritten text',
    },
  ],
  getDynamicInputs: (config) => {
    const variableNames: string[] = [];
    if (config.prompt) {
      variableNames.push(...getInputFromTemplate(config.prompt));
    }
    return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },
  async execute({ node, config, inputs, dispatcher }) {
    const executor = new RewriteExecutor();
    // Merge config and inputs for form
    const form = { ...config, ...inputs };
    // Minimal context for executor
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'user' as 'user', content: inputs.text || '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
      return {
        outputs: {
          rewrittenText: output.execution.output,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          modelId: form.model,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          rewrittenText: '',
        },
        status: 'error',
        error: `Rewrite failed: ${errorMessage}`,
        metadata: {
          modelId: form.model,
        },
      };
    }
  },
};

export default RewriteNode;
