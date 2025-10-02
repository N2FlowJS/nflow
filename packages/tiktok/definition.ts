/**
 * TikTok Node Definition
 * 
 * Integration with TikTok API for video management and user interactions.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface TikTokConfig {
  name?: string;
  action: 'upload_video' | 'get_user_info' | 'get_videos' | 'get_hashtag_videos';
  accessToken: string;
  videoFile?: string;
  caption?: string;
  hashtag?: string;
  userId?: string;
}

const TikTokNodeDefinition: NodeDefinition<TikTokConfig> = {
  id: 'tiktok',
  name: 'TikTok',
  category: NodeCategory.API,
  description: 'Integrate with TikTok API for video management and user interactions',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'TikTok operation to perform',
      required: true,
      defaultValue: 'upload_video',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Upload Video', value: 'upload_video' },
          { label: 'Get User Info', value: 'get_user_info' },
          { label: 'Get Videos', value: 'get_videos' },
          { label: 'Get Hashtag Videos', value: 'get_hashtag_videos' },
        ],
      },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'TikTok access token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter access token...', isPassword: true },
    },
    {
      id: 'videoFile',
      name: 'Video File Path',
      type: PortType.TEXT,
      description: 'Path to video file for upload',
      required: false,
      metadata: { inputType: 'text', placeholder: './video.mp4' },
    },
    {
      id: 'caption',
      name: 'Caption',
      type: PortType.TEXT,
      description: 'Video caption (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Write a caption...' },
    },
    {
      id: 'hashtag',
      name: 'Hashtag',
      type: PortType.TEXT,
      description: 'Hashtag to search (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: '#trending' },
    },
    {
      id: 'userId',
      name: 'User ID',
      type: PortType.TEXT,
      description: 'TikTok user ID',
      required: false,
      metadata: { inputType: 'text', placeholder: 'User ID' },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'TikTok API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: TikTokConfig) => {
    const variableNames = new Set<string>();
    
    if (config.caption) {
      getInputFromTemplate(config.caption).forEach(v => variableNames.add(v));
    }
    if (config.hashtag) {
      getInputFromTemplate(config.hashtag).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...TikTokNodeDefinition.inputs, ...dynamicPorts];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      if (!config.accessToken) {
        throw new Error('TikTok access token is required');
      }
      
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      const processedCaption = config.caption ? processTemplate(config.caption, vars) : '';
      const result = { message: 'TikTok API placeholder', caption: processedCaption };
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
        error: error?.message || 'Unknown TikTok error',
      };
    }
  },
};

export default TikTokNodeDefinition;
