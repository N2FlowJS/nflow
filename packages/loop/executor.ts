/**
 * Loop Node Executor - Refactored using BaseNodeExecutor
 * Iterates over arrays, objects, or ranges
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { LoopForm } from './types';

/**
 * Loop result structure
 */
interface LoopResult {
  iterations: number;
  results: any[];
  completed: boolean;
}

/**
 * Loop node executor - iterates over data structures
 */
export class LoopExecutor extends BaseNodeExecutor<LoopForm> {
  constructor() {
    super({
      nodeType: 'loop',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['inputData'],
    });
  }

  /**
   * Execute loop logic
   */
  protected async executeLogic(form: LoopForm, context: ExecutionContext): Promise<string> {
    // Process input data template
    const inputDataString = this.processTemplate(form.inputData || '', context);

    // Parse input data
    let loopData: any;
    try {
      loopData = JSON.parse(inputDataString);
    } catch {
      // Fallback: treat as comma-separated list
      loopData = inputDataString.split(',').map((item) => item.trim());
    }

    const maxIterations = form.maxIterations || 100;
    console.log(
      `[Loop] Node ${context.node.id}: Type ${form.loopType}, max ${maxIterations} iterations`
    );

    // Execute loop based on type
    const results: any[] = [];
    let iterations = 0;

    switch (form.loopType) {
      case 'array':
        iterations = this.loopArray(loopData, form, maxIterations, results);
        break;

      case 'object':
        iterations = this.loopObject(loopData, form, maxIterations, results);
        break;

      case 'range':
        iterations = this.loopRange(form, maxIterations, results);
        break;

      default:
        throw new Error(`Unsupported loop type: ${form.loopType}`);
    }

    console.log(`[Loop] Node ${context.node.id}: Completed ${iterations} iterations`);

    // Create result
    const result: LoopResult = {
      iterations,
      results,
      completed: true,
    };

    return JSON.stringify(result, null, 2);
  }

  /**
   * Loop through array
   */
  private loopArray(data: any, form: LoopForm, maxIterations: number, results: any[]): number {
    if (!Array.isArray(data)) {
      throw new Error('Input data is not an array for array loop type');
    }

    let iterations = 0;
    for (let i = 0; i < Math.min(data.length, maxIterations); i++) {
      results.push({
        [form.currentIndexVariable]: i,
        [form.currentItemVariable]: data[i],
        iteration: i + 1,
      });
      iterations++;
    }

    return iterations;
  }

  /**
   * Loop through object properties
   */
  private loopObject(data: any, form: LoopForm, maxIterations: number, results: any[]): number {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('Input data is not an object for object loop type');
    }

    let iterations = 0;
    const keys = Object.keys(data);

    for (let i = 0; i < Math.min(keys.length, maxIterations); i++) {
      const key = keys[i];
      results.push({
        [form.currentIndexVariable]: i,
        [form.currentItemVariable]: { key, value: data[key] },
        iteration: i + 1,
      });
      iterations++;
    }

    return iterations;
  }

  /**
   * Loop through numeric range
   */
  private loopRange(form: LoopForm, maxIterations: number, results: any[]): number {
    const start = form.startIndex || 0;
    const end = form.endIndex || 10;
    const step = form.stepSize || 1;

    if (step <= 0) {
      throw new Error('Step size must be greater than 0');
    }

    let iterations = 0;
    for (let i = start; i < Math.min(end, start + maxIterations * step); i += step) {
      results.push({
        [form.currentIndexVariable]: i,
        [form.currentItemVariable]: i,
        iteration: iterations + 1,
      });
      iterations++;
    }

    return iterations;
  }
}

// Export singleton instance
export const loopExecutor = new LoopExecutor();
