/**
 * WeChat Node Definition
 * 
 * Integration with WeChat Official Account API for messaging and user management.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
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
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'WeChat operation to perform',
      required: true,
      defaultValue: 'send_message',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Send Message', value: 'send_message' },
          { label: 'Send Template', value: 'send_template' },
          { label: 'Get User Info', value: 'get_user_info' },
          { label: 'Create Menu', value: 'create_menu' },
          { label: 'Get QR Code', value: 'get_qrcode' },
        ],
      },
    },
    {
      id: 'appId',
      name: 'App ID',
      type: PortType.TEXT,
      description: 'WeChat App ID',
      required: true,
      metadata: { inputType: 'text', placeholder: 'wx...' },
    },
    {
      id: 'appSecret',
      name: 'App Secret',
      type: PortType.TEXT,
      description: 'WeChat App Secret',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter app secret...', isPassword: true },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'Access token (optional, will be generated if not provided)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Access token...', isPassword: true },
    },
    {
      id: 'openId',
      name: 'OpenID',
      type: PortType.TEXT,
      description: 'User OpenID (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'User OpenID' },
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Message content (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'Enter message...' },
    },
    {
      id: 'templateId',
      name: 'Template ID',
      type: PortType.TEXT,
      description: 'WeChat template ID (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Template ID' },
    },
    {
      id: 'menuData',
      name: 'Menu Data',
      type: PortType.TEXT,
      description: 'Menu configuration JSON (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: '{"button":[...]}' },
    },
    {
      id: 'scene',
      name: 'Scene',
      type: PortType.TEXT,
      description: 'QR code scene (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'QR code scene' },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'WeChat API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: WeChatConfig) => {
    const variableNames = new Set<string>();
    
    const templateFields = [
      config.message,
      config.openId,
      config.templateId,
      config.menuData,
      config.scene,
    ];
    
    templateFields.forEach(field => {
      if (field) {
        getInputFromTemplate(field).forEach(v => variableNames.add(v));
      }
    });
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...WeChatNodeDefinition.inputs, ...dynamicPorts];
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
