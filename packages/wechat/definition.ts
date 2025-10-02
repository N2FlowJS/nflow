/**
 * WeChat Node Definition
 * 
 * Integration with WeChat Official Account API for messaging and user management.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface WeChatConfig {
  name?: string;
  action: 'send_message' | 'send_template' | 'get_user_info' | 'create_menu' | 'get_qrcode';
  appId: string;
  appSecret: string;
  accessToken?: string;
  openId?: string;
  message?: string;
  templateId?: string;
  menuData?: string;
  scene?: string;
}

const WeChatNodeDefinition: NodeDefinition<WeChatConfig> = {
  id: 'wechat',
  name: 'WeChat',
  category: NodeCategory.API,
  description: 'Integrate with WeChat Official Account API for messaging and user management',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'trigger',
      name: 'Trigger',
      type: PortType.ANY,
      required: false,
    },
  ],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
    },
  ],
  
  getDynamicInputs: (config: WeChatConfig) => {
    const templateFields = [
      config.message,
      config.openId,
      config.templateId,
      config.menuData,
      config.scene,
    ].filter(Boolean);
    
    const variables = new Set<string>();
    templateFields.forEach(field => {
      if (field) {
        getInputFromTemplate(field).forEach(v => variables.add(v));
      }
    });
    
    return Array.from(variables).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: false,
    }));
  },
  
  config: {
    properties: {
      name: { type: 'string', title: 'Name', default: 'WeChat' },
      action: {
        type: 'string',
        title: 'Action',
        enum: ['send_message', 'send_template', 'get_user_info', 'create_menu', 'get_qrcode'],
        default: 'send_message',
      },
      appId: { type: 'string', title: 'App ID' },
      appSecret: { type: 'string', title: 'App Secret', format: 'password' },
      accessToken: { type: 'string', title: 'Access Token (optional)', format: 'password' },
      openId: {
        type: 'string',
        title: 'OpenID',
        description: 'User OpenID (supports {variable} templates)',
      },
      message: {
        type: 'string',
        title: 'Message',
        format: 'textarea',
        description: 'Message content (supports {variable} templates)',
      },
      templateId: {
        type: 'string',
        title: 'Template ID',
        description: 'WeChat template ID (supports {variable} templates)',
      },
      menuData: {
        type: 'string',
        title: 'Menu Data',
        format: 'textarea',
        description: 'Menu configuration JSON (supports {variable} templates)',
      },
      scene: {
        type: 'string',
        title: 'Scene',
        description: 'QR code scene (supports {variable} templates)',
      },
    },
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      if (!config.appId || !config.appSecret) {
        throw new Error('WeChat App ID and App Secret are required');
      }
      
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      let result: any;
      
      switch (config.action) {
        case 'send_message':
          if (!config.openId || !config.message) {
            throw new Error('OpenID and message content are required');
          }
          const processedMessage = processTemplate(config.message, vars);
          const processedOpenId = processTemplate(config.openId, vars);
          result = {
            message: 'WeChat API placeholder',
            action: 'send_message',
            openId: processedOpenId,
            content: processedMessage,
          };
          break;
          
        case 'send_template':
          if (!config.openId || !config.templateId) {
            throw new Error('OpenID and template ID are required');
          }
          const processedTemplateOpenId = processTemplate(config.openId, vars);
          const processedTemplateId = processTemplate(config.templateId, vars);
          result = {
            message: 'WeChat API placeholder',
            action: 'send_template',
            openId: processedTemplateOpenId,
            templateId: processedTemplateId,
          };
          break;
          
        default:
          result = { message: `WeChat API placeholder for action: ${config.action}` };
      }
      
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
        error: error?.message || 'Unknown WeChat error',
      };
    }
  },
};

export default WeChatNodeDefinition;
