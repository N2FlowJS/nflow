import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Prisma Read Node Definition
 * 
 * Read data from database using Prisma ORM.
 * Uses shared Prisma client instance for efficient connection pooling.
 * 
 * Configuration:
 * - model: Prisma model name (e.g., "User", "Post")
 * - filter: JSON filter object (supports {variable} templates)
 * - limit: Maximum records to return (optional)
 * 
 * Features:
 * - Type-safe database queries
 * - Automatic connection management
 * - JSON filter with template variables
 * - Model validation
 * - Result limiting
 * 
 * Example:
 * ```json
 * {
 *   "model": "User",
 *   "filter": "{\"email\": \"{userEmail}\", \"status\": \"active\"}",
 *   "limit": 10
 * }
 * ```
 * 
 * Note:
 * - Requires Prisma schema to be defined
 * - Uses shared Prisma client from lib/prisma
 * - Model names are case-sensitive
 */
export const PrismaReadNodeDefinition: NodeDefinition = {
  id: 'prisma-read',
  name: 'Prisma Read',
  category: NodeCategory.DATABASE,
  description: 'Read data from database using Prisma ORM',
  version: '1.0.0',

  inputs: [
    {
      id: 'model',
      name: 'Model',
      type: PortType.TEXT,
      description: 'Prisma model name (case-sensitive)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'User' },
    },
    {
      id: 'filter',
      name: 'Filter (JSON)',
      type: PortType.TEXT,
      description: 'JSON filter object (supports {variable} templates)',
      required: false,
      defaultValue: '{}',
      metadata: { inputType: 'textarea', rows: 4, placeholder: '{"email": "{userEmail}", "status": "active"}' },
    },
    {
      id: 'limit',
      name: 'Limit',
      type: PortType.NUMBER,
      description: 'Maximum records to return (optional)',
      required: false,
      metadata: { inputType: 'number', min: 1, max: 1000 },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Query Results',
      type: PortType.JSON,
      description: 'Query result records',
    },
    {
      id: 'count',
      name: 'Record Count',
      type: PortType.NUMBER,
      description: 'Number of records returned',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filter) {
      getInputFromTemplate(config.filter as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Filter parameter: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...PrismaReadNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.filter as string) || '{}');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { results: [], count: 0 },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      if (!config.model || String(config.model).trim() === '') {
        throw new Error('No model specified');
      }

      const model = String(config.model).trim();

      // Process filter template
      const filterStr = config.filter ? processTemplate(config.filter as string, vars) : '{}';
      
      let filter: Record<string, any>;
      try {
        filter = JSON.parse(filterStr);
      } catch (parseError) {
        throw new Error(`Invalid filter JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
      }

      // Import shared Prisma client
      const { prisma } = await import('../../lib/prisma');

      // Validate model exists
      if (!(prisma as any)[model]) {
        throw new Error(`Model '${model}' not found in Prisma schema`);
      }

      // Build query options
      const queryOptions: any = {
        where: filter
      };

      if (config.limit) {
        queryOptions.take = config.limit as number;
      }

      // Execute query
      const results = await (prisma as any)[model].findMany(queryOptions);

      const formattedResults = JSON.stringify(results, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, formattedResults, 'prismaread');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results,
          count: Array.isArray(results) ? results.length : 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          model,
          filter: filterStr,
          recordCount: Array.isArray(results) ? results.length : 0
        }
      };
    } catch (error: unknown) {
      console.error('Prisma Read execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Prisma error';

      return {
        outputs: {
          results: [],
          count: 0
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
