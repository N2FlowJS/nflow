import { FlowNode, CategorizeNodeData, ICategory } from '../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../types/flowExecutionTypes';
import { findNextNode } from '@utils/findNextNode';
import { processInputReferences, getInputFromSource } from '../../hooks/useInputReferences';
import { prisma } from '../../lib/prisma';
import { th } from 'date-fns/locale';

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
  const inputToCategorize = getInputFromSource(form.inputRefs, flowState);

  // Create node info object for consistent response

  if (!inputToCategorize) {
    throw new Error('No input available to categorize');
  }

  try {
    // Get categories from the form
    const categories = form.categories || [];
    const defaultCategory = form.defaultCategory || '';

    if (categories.length === 0) {
      throw new Error('No categories defined for categorization');
    }

    // Get model ID (use default chat model if not specified)
    const modelId = form.model;
    let model;

    if (modelId) {
      model = await prisma.lLMModel.findUnique({
        where: { id: modelId },
        include: { provider: true },
      });
    } else {
      model = await prisma.lLMModel.findFirst({
        where: {
          modelType: 'chat',
          isDefault: true,
          isActive: true,
        },
        include: { provider: true },
      });
    }

    if (!model) {
      throw new Error('No suitable model found for categorization');
    }

    if (!model.provider) {
      throw new Error('Provider not found for this model');
    }

    // Build the prompt for categorization
    const categoriesDescription = categories.map((c) => `- ${c.name}: ${c.description}${c.examples ? `\n  Examples: ${c.examples.join(', ')}` : ''}`).join('\n');

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

      case 'openai-compatible':
        responseText = await callCustomAPI(model.provider, model, prompt);
        break;
      default:
        return {
          status: 'error',
          message: `Unsupported provider type: ${model.provider.providerType}`,
          flowState,
          nodeInfo: {
            id: node.id,
            name: node.data?.label || node.id,
            type: 'categorize',
            role: 'developer',
          },
          execution: {
            output: `Unsupported provider type: ${model.provider.providerType}`,
            nodeId: node.id,
            nodeName: node.data?.label || node.id,
            startTime: new Date().toISOString(),
          },
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
          const matchedCategory = categories.find((cat) => cat.name === responseJson.category);

          // If no category matched, use the default category
          categoryToUse = matchedCategory ? matchedCategory.name : defaultCategory;

          // Ensure confidence is a number between 0 and 1
          confidence = typeof responseJson.confidence === 'number' ? Math.min(Math.max(responseJson.confidence, 0), 1) : 1.0;
        }
      }
    } catch (error) {
      console.error('Failed to parse LLM response for categorization:', error);
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
      nextNodeId = categoryObj.targetNode;
    } else {
      nextNodeId = findNextNode(flow, node.id, categoryToUse);
    }

    if (!flowState.components[node.id]) flowState.components[node.id] = {};
    flowState.components[node.id]['output'] = categoryToUse;
    flowState.components[node.id]['type'] = 'categorize';


    if (!nextNodeId) {
      throw new Error(`At the Node ${node.data.label} next node found in the flow`);
    }


    return {
      status: 'in_progress',
      nextNodeId,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'categorize',
        role: 'developer',
      },
      execution: {
        output: categoryToUse,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in categorize node:', error);
    throw new Error(`Error categorizing input: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call the OpenAI API
 */
async function callOpenAIAPI(provider: any, model: any, prompt: string): Promise<string> {
  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more deterministic categorization
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call a custom API endpoint
 */
async function callCustomAPI(provider: any, model: any, prompt: string): Promise<string> {
  // Prepare request body based on provider configuration

  const response = await fetch(provider.endpointUrl + 'chat/completions', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },

    body: JSON.stringify({
      model: model.name,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Custom API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
