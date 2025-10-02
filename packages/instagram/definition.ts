/**
 * Instagram Node Definition
 * 
 * Integration with Instagram API for posting content and managing account.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface InstagramConfig {
  name?: string;
  action: 'create_post' | 'get_user_info' | 'get_media';
  accessToken: string;
  caption?: string;
  mediaUrl?: string;
}

const InstagramNodeDefinition: NodeDefinition<InstagramConfig> = {
  id: 'instagram',
  name: 'Instagram',
  category: NodeCategory.API,
  description: 'Integrate with Instagram API for posting content and managing account',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Instagram operation to perform',
      required: true,
      defaultValue: 'create_post',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Post', value: 'create_post' },
          { label: 'Get User Info', value: 'get_user_info' },
          { label: 'Get Media', value: 'get_media' },
        ],
      },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'Instagram access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter access token...', isPassword: true },
    },
    {
      id: 'caption',
      name: 'Caption',
      type: PortType.TEXT,
      description: 'Post caption (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Write a caption...' },
    },
    {
      id: 'mediaUrl',
      name: 'Media URL',
      type: PortType.TEXT,
      description: 'Media URL for post',
      required: false,
      metadata: { inputType: 'text', placeholder: 'https://...' },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'Instagram API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: InstagramConfig) => {
    const variableNames = new Set<string>();
    
    if (config.caption) {
      getInputFromTemplate(config.caption).forEach(v => variableNames.add(v));
    }
    if (config.mediaUrl) {
      getInputFromTemplate(config.mediaUrl).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...InstagramNodeDefinition.inputs, ...dynamicPorts];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      if (!config.accessToken) {
        throw new Error('Instagram access token is required');
      }
      
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      const processedCaption = config.caption ? processTemplate(config.caption, vars) : '';
      const result = { message: 'Instagram API placeholder', caption: processedCaption };
      const resultText = JSON.stringify(result, null, 2);
      
      return {
        outputs: { output: resultText },
        status: 'success',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: resultText,
          },
        },
      };
    } catch (error: any) {
      return {
        outputs: {},
        status: 'error',
        error: error?.message || 'Unknown Instagram error',
      };
    }
  },
};

export default InstagramNodeDefinition;
