/**
 * Twitter Node Definition
 * 
 * Integration with Twitter/X API for posting tweets, searching, and social interactions.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface TwitterConfig {
  name?: string;
  action: 'create_tweet' | 'get_tweets' | 'get_user_info' | 'follow_user' | 'like_tweet' | 'retweet' | 'search_tweets';
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  tweetText?: string;
  tweetId?: string;
  username?: string;
  userId?: string;
  query?: string;
  maxResults?: number;
}

const TwitterNodeDefinition: NodeDefinition<TwitterConfig> = {
  id: 'twitter',
  name: 'Twitter/X',
  category: NodeCategory.API,
  description: 'Integrate with Twitter/X API for posting, searching, and social interactions',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Twitter operation to perform',
      required: true,
      defaultValue: 'create_tweet',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Create Tweet', value: 'create_tweet' },
          { label: 'Get Tweets', value: 'get_tweets' },
          { label: 'Get User Info', value: 'get_user_info' },
          { label: 'Follow User', value: 'follow_user' },
          { label: 'Like Tweet', value: 'like_tweet' },
          { label: 'Retweet', value: 'retweet' },
          { label: 'Search Tweets', value: 'search_tweets' },
        ],
      },
    },
    {
      id: 'apiKey',
      name: 'API Key',
      type: PortType.TEXT,
      description: 'Twitter API Key',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter API Key...', isPassword: true },
    },
    {
      id: 'apiSecret',
      name: 'API Secret',
      type: PortType.TEXT,
      description: 'Twitter API Secret',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter API Secret...', isPassword: true },
    },
    {
      id: 'accessToken',
      name: 'Access Token',
      type: PortType.TEXT,
      description: 'Twitter Access Token',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter Access Token...', isPassword: true },
    },
    {
      id: 'accessTokenSecret',
      name: 'Access Token Secret',
      type: PortType.TEXT,
      description: 'Twitter Access Token Secret',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter Token Secret...', isPassword: true },
    },
    {
      id: 'tweetText',
      name: 'Tweet Text',
      type: PortType.TEXT,
      description: 'Tweet content (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'textarea', placeholder: 'What\'s happening?' },
    },
    {
      id: 'tweetId',
      name: 'Tweet ID',
      type: PortType.TEXT,
      description: 'Tweet ID for like/retweet operations',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Tweet ID' },
    },
    {
      id: 'username',
      name: 'Username',
      type: PortType.TEXT,
      description: 'Twitter username (without @)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'username' },
    },
    {
      id: 'userId',
      name: 'User ID',
      type: PortType.TEXT,
      description: 'Twitter user ID',
      required: false,
      metadata: { inputType: 'text', placeholder: 'User ID' },
    },
    {
      id: 'query',
      name: 'Search Query',
      type: PortType.TEXT,
      description: 'Search query (supports {variable} templates)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Search for tweets...' },
    },
    {
      id: 'maxResults',
      name: 'Max Results',
      type: PortType.NUMBER,
      description: 'Maximum number of results (1-100)',
      required: false,
      defaultValue: 10,
      metadata: { inputType: 'number', min: 1, max: 100 },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.JSON,
      description: 'Twitter API response',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: TwitterConfig) => {
    const variableNames = new Set<string>();
    
    if (config.tweetText) {
      getInputFromTemplate(config.tweetText).forEach(v => variableNames.add(v));
    }
    if (config.query) {
      getInputFromTemplate(config.query).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...TwitterNodeDefinition.inputs, ...dynamicPorts];
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      if (!config.apiKey || !config.apiSecret || !config.accessToken || !config.accessTokenSecret) {
        throw new Error('Twitter API credentials are required');
      }
      
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      let result: any;
      
      switch (config.action) {
        case 'create_tweet':
          if (!config.tweetText) {
            throw new Error('Tweet text is required');
          }
          const processedTweet = processTemplate(config.tweetText, vars);
          result = { message: 'Twitter API integration placeholder', tweet: processedTweet };
          break;
          
        case 'search_tweets':
          if (!config.query) {
            throw new Error('Search query is required');
          }
          const processedQuery = processTemplate(config.query, vars);
          result = { message: 'Twitter API integration placeholder', query: processedQuery };
          break;
          
        default:
          result = { message: `Twitter API integration placeholder for action: ${config.action}` };
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
        error: error?.message || 'Unknown Twitter error',
      };
    }
  },
};

export default TwitterNodeDefinition;
