import { FlowNode, GenerateNodeData } from '../../../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../../types/flowExecutionTypes';
import { processTemplate } from '../templateProcessor';
import { findNextNode } from '../flowExecutionService';
import { prisma } from '../../../../../lib/prisma';

/**
 * Handler for executing Generate nodes
 */
export async function executeGenerateNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as GenerateNodeData;
  // Ensure form exists with a default empty object
  const form = data.form || {};

  // Create node info object for consistent response
  const nodeInfo = {
    id: node.id,
    name: form.name || node.id,
    type: 'generate'
  };

  try {
    // Enhance variables with context before processing prompt
    const enhancedVariables = {
      ...flowState.variables,
      // Make retrieved context and user input directly available in the prompt template
      context: flowState.variables.retrievalContext || '',
      question: flowState.variables.lastUserInput || flowState.variables.userInput || '',
    };
    
    // Process the prompt template with enhanced variables
    const prompt = processTemplate(form.prompt || '', enhancedVariables);

    // Get model ID
    const modelId = form.model;

    if (!modelId) {
      return {
        status: 'error',
        message: 'No AI model specified',
        flowState,
        nodeInfo
      };
    }

    // Fetch the model details directly from the database
    const model = await prisma.lLMModel.findUnique({
      where: { id: modelId },
      include: { provider: true }
    });
    
    if (!model) {
      return {
        status: 'error',
        message: 'Model not found',
        flowState,
        nodeInfo
      };
    }
    
    if (!model.provider) {
      return {
        status: 'error',
        message: 'Provider not found for this model',
        flowState,
        nodeInfo
      };
    }
    
    // Process the request based on provider type
    let aiResponse = '';
    
    switch (model.provider.providerType) {
      case 'openai':
        aiResponse = await callOpenAIAPI(model.provider, model, prompt);
        break;
      case 'azure':
        aiResponse = await callAzureOpenAIAPI(model.provider, model, prompt);
        break;
      case 'custom':
        aiResponse = await callCustomAPI(model.provider, model, prompt);
        break;
      default:
        return {
          status: 'error',
          message: `Unsupported provider type: ${model.provider.providerType}`,
          flowState,
          nodeInfo
        };
    }

    // Get output variable name (with fallback)
    const outputVarName = form.outputVariable || form.name || 'generatedText';
    
    // Store the response in the specified variable name
    flowState.variables[outputVarName] = aiResponse;
    
    // Also store in common variables for easy access in interface nodes
    flowState.variables.generatedOutput = aiResponse;
    flowState.variables.lastResponse = aiResponse;

    // Add to history
    flowState.history.push({
      nodeId: node.id,
      nodeType: 'generate',
      timestamp: new Date().toISOString(),
      input: prompt,
      output: aiResponse,
      status: 'success'
    });

    // Find the next node
    const nextNodeId = findNextNode(flow, node.id);

    if (!nextNodeId) {
      return {
        status: 'completed',
        output: aiResponse,
        flowState,
        nodeInfo
      };
    }

    return {
      status: 'in_progress',
      output: aiResponse,
      nextNodeId,
      flowState,
      nodeInfo
    };
  } catch (error) {
    console.error('Error in generate node:', error);
    return {
      status: 'error',
      message: `Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
      nodeInfo
    };
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  const response = await fetch(provider.endpointUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      ...(options?.stop && { stop: options.stop })
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call the Azure OpenAI API
 */
async function callAzureOpenAIAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  const deploymentName = model.config?.deployment_name || model.name;
  const apiVersion = provider.config?.api_version || '2023-05-15';
  
  const response = await fetch(`${provider.endpointUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': provider.apiKey
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      ...(options?.stop && { stop: options.stop })
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Azure OpenAI API error (${response.status}): ${errorData}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call a custom API endpoint
 */
async function callCustomAPI(provider: any, model: any, prompt: string, options?: any): Promise<string> {
  // Get custom configuration
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Add authentication if provided
  if (provider.apiKey) {
    const authType = provider.config?.auth_type || 'Bearer';
    headers['Authorization'] = `${authType} ${provider.apiKey}`;
  }
  
  // Support for custom headers
  if (provider.config?.custom_headers) {
    Object.assign(headers, provider.config.custom_headers);
  }
  
  // Prepare request body based on provider configuration
  const bodyTemplate = provider.config?.body_template || { 
    model: "{{model_name}}", 
    prompt: "{{prompt}}" 
  };
  
  // Replace placeholders in body template
  let bodyStr = JSON.stringify(bodyTemplate)
    .replace(/"{{model_name}}"/g, `"${model.name}"`)
    .replace(/"{{prompt}}"/g, `"${prompt.replace(/"/g, '\\"')}"`);
  
  // Add options if configured
  if (options) {
    Object.keys(options).forEach(key => {
      bodyStr = bodyStr.replace(new RegExp(`"{{${key}}}"`, 'g'), 
        options[key] !== undefined ? String(options[key]) : 'null');
    });
  }
  
  const body = JSON.parse(bodyStr);
  
  const response = await fetch(provider.endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Custom API error (${response.status}): ${errorData}`);
  }
  
  const data = await response.json();
  
  // Extract response content based on response_path configuration
  const responsePath = provider.config?.response_path || 'response';
  return extractValueByPath(data, responsePath);
}

/**
 * Helper to extract a value from an object using a dot-notation path
 */
function extractValueByPath(obj: any, path: string): string {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
}
