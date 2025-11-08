/**
 * Delay Node Executor - Refactored using BaseNodeExecutor
 * Pauses flow execution for specified duration
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { DelayForm } from './types';

/**
 * Delay node executor - pauses execution for specified duration
 */
export class DelayExecutor extends BaseNodeExecutor<DelayForm> {
  constructor() {
    super({
      nodeType: 'delay',
      defaultRole: 'developer',
      checkInputReadiness: false, // Delay doesn't need inputs
      templateFields: [], // No template fields
    });
  }

  /**
   * Execute delay logic - wait for specified duration and pass through input
   */
  protected async executeLogic(form: DelayForm, context: ExecutionContext): Promise<string> {
    // Validate duration
    if (!form.duration || form.duration <= 0) {
      throw new Error('Invalid delay duration specified');
    }

    // Convert duration to milliseconds
    const delayMs = this.convertToMilliseconds(form.duration, form.unit);

    // Validate maximum delay (1 hour)
    const maxDelayMs = 60 * 60 * 1000;
    if (delayMs > maxDelayMs) {
      throw new Error(
        `Delay duration too long. Maximum allowed is 1 hour, requested: ${form.duration} ${form.unit}`
      );
    }

    console.log(
      `[Delay] Node ${context.node.id}: Waiting ${form.duration} ${form.unit} (${delayMs}ms)`
    );

    // Execute the delay
    await this.sleep(delayMs);

    console.log(`[Delay] Node ${context.node.id}: Completed`);

    // Pass through the previous output or return completion message
    const previousOutput = context.flowState.components[context.node.id]?.input?.content;
    return previousOutput || 'Delay completed';
  }

  /**
   * Convert duration to milliseconds based on unit
   */
  private convertToMilliseconds(duration: number, unit: 'seconds' | 'minutes' | 'hours'): number {
    switch (unit) {
      case 'minutes':
        return duration * 60 * 1000;
      case 'hours':
        return duration * 60 * 60 * 1000;
      case 'seconds':
      default:
        return duration * 1000;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const delayExecutor = new DelayExecutor();
