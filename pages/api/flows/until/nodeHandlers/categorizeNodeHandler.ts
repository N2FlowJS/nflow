import { FlowNode, CategorizeNodeData, ICategory } from '../../../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../../types/flowExecutionTypes';
import { findNextNode } from '../flowExecutionService';
import { processInputReferences, getInputFromSource } from '../../../../../hooks/useInputReferences';
import { prisma } from '../../../../../lib/prisma';

/**
 * Handler for executing Categorize nodes
 */
export async function executeCategorizeNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as CategorizeNodeData;
  const form = data.form || {};

  // Process any input references using the shared hook
  processInputReferences(form.inputRefs, flowState.variables);

  // Get the input to categorize using the shared input source resolver
  const inputToCategorize = getInputFromSource(form.inputSource, flowState.variables, flowState.history);

  // Create node info object for consistent response
  const nodeInfo = {
    id: node.id,
    name: form.name || node.id,
    type: 'categorize',
  };

  if (!inputToCategorize) {
    return {
      status: 'error',
      message: 'No input available to categorize',
      flowState,
      nodeInfo,
    };
  }

  try {
    // Get categories from the form
    const categories = form.categories || [];
    const defaultCategory = form.defaultCategory || '';

    if (categories.length === 0) {
      return {
        status: 'error',
        message: 'No categories defined',
        flowState,
        nodeInfo,
      };
    }

    // Get model ID (use default chat model if not specified)
    const modelId = form.model;
    let model;
    
    if (modelId) {
      model = await prisma.lLMModel.findUnique({
        where: { id: modelId },
        include: { provider: true }
      });
    } else {
      model = await prisma.lLMModel.findFirst({
        where: { 
          modelType: 'chat',
          isDefault: true,
          isActive: true
        },
        include: { provider: true }
      });
    }
    
    if (!model) {
      return {
        status: 'error',
        message: 'No suitable model found for categorization',
        flowState,
        nodeInfo,
      };
    }
    
    if (!model.provider) {
      return {
        status: 'error',
        message: 'Provider not found for this model',
        flowState,
        nodeInfo,
      };
    }
    
    // Build the prompt for categorization
    const categoriesDescription = categories.map(c => 
      `- ${c.name}: ${c.description}${c.examples ? `\n  Examples: ${c.examples.join(", ")}` : ""}`
    ).join("\n");
    
    const prompt = `
I need to categorize the following text into one of these categories:

${categoriesDescription}

Text to categorize:
"""
${inputToCategorize}
"""

Analyze the text and determine which category it belongs to. Respond with ONLY the category name and a confidence score between 0 and 1, in this exact JSON format:
{"category": "category_name", "confidence": 0.95}
`.trim();
    
    // Process based on provider type
    let responseText = '';
    
    switch (model.provider.providerType) {
      case 'openai':
        responseText = await callOpenAIAPI(model.provider, model, prompt);
        break;
      case 'azure':
        responseText = await callAzureOpenAIAPI(model.provider, model, prompt);
        break;
      case 'custom':
        responseText = await callCustomAPI(model.provider, model, prompt);
        break;
      default:
        return {
          status: 'error',
          message: `Unsupported provider type: ${model.provider.providerType}`,
          flowState,
          nodeInfo,
        };
    }
    
    // Parse the JSON response
    let categoryToUse = defaultCategory;
    let confidence = 0;
    
    try {
      // Extract JSON from potential text (in case LLM adds extra explanation)
      const jsonMatch = responseText.match(/\{[^{]*"category"[^}]*\}/);
      if (jsonMatch) {
        const responseJson = JSON.parse(jsonMatch[0]);
        
        if (responseJson.category) {
          // Find the matching category
          const matchedCategory = categories.find(cat => cat.name === responseJson.category);
          
          // If no category matched, use the default category
          categoryToUse = matchedCategory ? matchedCategory.name : defaultCategory;
          
          // Ensure confidence is a number between 0 and 1
          confidence = typeof responseJson.confidence === 'number' 
            ? Math.min(Math.max(responseJson.confidence, 0), 1)
            : 1.0;
        }
      }
    } catch (error) {
      console.error("Failed to parse LLM response for categorization:", error);
      // Falls back to default category
    }

    // Store the categorization result in variables
    flowState.variables.category = categoryToUse;
    flowState.variables.categorization = {
      input: inputToCategorize,
      result: categoryToUse,
      confidence: confidence,
    };

    // Add to history
    flowState.history.push({
      nodeId: node.id,
      nodeType: 'categorize',
      timestamp: new Date().toISOString(),
      input: inputToCategorize,
      output: categoryToUse,
      status: 'success',
    });

    // Find the target node for this category
    const categoryObj = categories.find((cat: ICategory) => cat.name === categoryToUse);
    let nextNodeId = null;

    if (categoryObj && categoryObj.targetNode) {
      // Use the explicitly defined target node
      nextNodeId = categoryObj.targetNode;
    } else {
      // Or find the next node via edge with this category
      nextNodeId = findNextNode(flow, node.id, categoryToUse);
    }

    if (!nextNodeId) {
      return {
        status: 'completed',
        output: `Categorized as "${categoryToUse}"`,
        flowState,
        nodeInfo,
      };
    }

    return {
      status: 'in_progress',
      output: `Categorized as "${categoryToUse}"`,
      nextNodeId,
      flowState,
      nodeInfo,
    };
  } catch (error) {
    console.error('Error in categorize node:', error);
    return {
      status: 'error',
      message: `Error categorizing input: ${error instanceof Error ? error.message : 'Unknown error'}`,
      flowState,
      nodeInfo,
    };
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
  const response = await fetch(provider.endpointUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more deterministic categorization
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
async function callAzureOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
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
      temperature: 0.3, // Lower temperature for more deterministic categorization
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
async function callCustomAPI(provider: any, model: any, prompt: string): Promise<string> {
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
  const bodyStr = JSON.stringify(bodyTemplate)
    .replace(/"{{model_name}}"/g, `"${model.name}"`)
    .replace(/"{{prompt}}"/g, `"${prompt.replace(/"/g, '\\"')}"`);
  
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
