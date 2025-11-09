import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { PrismaReadForm } from './types';

export class PrismaReadExecutor extends BaseNodeExecutor<PrismaReadForm> {
  constructor() {
    super({
      nodeType: 'prisma-read',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['filter'],
    });
  }

  protected async executeLogic(form: PrismaReadForm, context: ExecutionContext): Promise<string> {
    const { model, filter, limit } = form;

    if (!model || model.trim() === '') {
      throw new Error('No model specified');
    }

    // Process filter template
    const processedFilter = filter ? this.processTemplate(filter, context) : '{}';

    let parsedFilter: Record<string, any>;
    try {
      parsedFilter = JSON.parse(processedFilter);
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
      where: parsedFilter
    };

    if (limit) {
      queryOptions.take = limit;
    }

    // Execute query
    const results = await (prisma as any)[model].findMany(queryOptions);

    // Return structured result
    return JSON.stringify({
      results,
      count: Array.isArray(results) ? results.length : 0,
      metadata: {
        model,
        filter: processedFilter,
        recordCount: Array.isArray(results) ? results.length : 0
      }
    });
  }
}

export const prismaReadExecutor = new PrismaReadExecutor();
