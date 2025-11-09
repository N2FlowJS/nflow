/**
 * DateTime Node Executor - Refactored using BaseNodeExecutor
 * Comprehensive date/time operations: format, parse, add, subtract, compare, timezone
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { DateTimeForm } from './types';

/**
 * DateTime node executor - handles various date/time operations
 */
export class DateTimeExecutor extends BaseNodeExecutor<DateTimeForm> {
  constructor() {
    super({
      nodeType: 'datetime',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['inputDate', 'format'],
    });
  }

  /**
   * Execute datetime logic - perform the specified operation
   */
  protected async executeLogic(form: DateTimeForm, context: ExecutionContext): Promise<string> {
    const operation = form.operation;
    let result: any;

    switch (operation) {
      case 'now':
        result = this.getCurrentDateTime(form);
        break;

      case 'format':
        const inputDate = this.processTemplate((form.inputDate as string) || '', context);
        result = this.formatDateTime(form, inputDate);
        break;

      case 'parse':
        const dateString = this.processTemplate((form.inputDate as string) || '', context);
        result = this.parseDateTime(dateString);
        break;

      case 'add':
        const addDate = this.processTemplate((form.inputDate as string) || '', context);
        result = this.addToDateTime(form, addDate);
        break;

      case 'subtract':
        const subtractDate = this.processTemplate((form.inputDate as string) || '', context);
        result = this.subtractFromDateTime(form, subtractDate);
        break;

      case 'compare':
        const compareDate = this.processTemplate((form.inputDate as string) || '', context);
        result = this.compareDateTime(form, compareDate);
        break;

      case 'timezone':
        const timezoneDate = this.processTemplate((form.inputDate as string) || '', context);
        result = this.convertTimezone(form, timezoneDate);
        break;

      default:
        throw new Error(`Unsupported datetime operation: ${operation}`);
    }

    return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
  }

  /**
   * Get current date/time in specified format
   */
  private getCurrentDateTime(form: DateTimeForm): string {
    const now = new Date();
    const format = form.format || 'ISO';

    switch (format.toLowerCase()) {
      case 'iso':
        return now.toISOString();
      case 'timestamp':
        return now.getTime().toString();
      case 'date':
        return now.toISOString().split('T')[0];
      case 'time':
        return now.toTimeString().split(' ')[0];
      case 'locale':
        return now.toLocaleString();
      case 'utc':
        return now.toUTCString();
      default:
        return now.toISOString();
    }
  }

  /**
   * Format a date string to specified format
   */
  private formatDateTime(form: DateTimeForm, inputDate: string): any {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${inputDate}`);
    }

    const format = form.format || 'ISO';

    switch (format.toLowerCase()) {
      case 'iso':
        return date.toISOString();
      case 'timestamp':
        return date.getTime().toString();
      case 'date':
        return date.toISOString().split('T')[0];
      case 'time':
        return date.toTimeString().split(' ')[0];
      case 'locale':
        return date.toLocaleString();
      case 'utc':
        return date.toUTCString();
      default:
        // Custom format using toLocaleDateString options
        try {
          return date.toLocaleDateString('en-US', JSON.parse(format));
        } catch {
          return date.toISOString();
        }
    }
  }

  /**
   * Parse date string and return components
   */
  private parseDateTime(dateString: string): any {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }

    return {
      timestamp: date.getTime(),
      iso: date.toISOString(),
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-based
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
      dayOfWeek: date.getDay(), // 0-6, 0=Sunday
      timezoneOffset: date.getTimezoneOffset(),
    };
  }

  /**
   * Add time units to a date
   */
  private addToDateTime(form: DateTimeForm, inputDate: string): string {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${inputDate}`);
    }

    const amount = form.amount || 0;
    const unit = form.unit || 'days';

    switch (unit) {
      case 'seconds':
        date.setSeconds(date.getSeconds() + amount);
        break;
      case 'minutes':
        date.setMinutes(date.getMinutes() + amount);
        break;
      case 'hours':
        date.setHours(date.getHours() + amount);
        break;
      case 'days':
        date.setDate(date.getDate() + amount);
        break;
      case 'weeks':
        date.setDate(date.getDate() + amount * 7);
        break;
      case 'months':
        date.setMonth(date.getMonth() + amount);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + amount);
        break;
    }

    return this.formatDateTime(form, date.toISOString());
  }

  /**
   * Subtract time units from a date
   */
  private subtractFromDateTime(form: DateTimeForm, inputDate: string): string {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${inputDate}`);
    }

    const amount = form.amount || 0;
    const unit = form.unit || 'days';

    switch (unit) {
      case 'seconds':
        date.setSeconds(date.getSeconds() - amount);
        break;
      case 'minutes':
        date.setMinutes(date.getMinutes() - amount);
        break;
      case 'hours':
        date.setHours(date.getHours() - amount);
        break;
      case 'days':
        date.setDate(date.getDate() - amount);
        break;
      case 'weeks':
        date.setDate(date.getDate() - amount * 7);
        break;
      case 'months':
        date.setMonth(date.getMonth() - amount);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() - amount);
        break;
    }

    return this.formatDateTime(form, date.toISOString());
  }

  /**
   * Compare two dates
   */
  private compareDateTime(form: DateTimeForm, inputDate: string): any {
    const date1 = new Date(inputDate);
    const date2 = new Date(form.target || '');

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      throw new Error(`Invalid dates: ${inputDate}, ${form.target}`);
    }

    const diffMs = date1.getTime() - date2.getTime();
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    return {
      comparison: diffMs > 0 ? 'after' : diffMs < 0 ? 'before' : 'equal',
      difference: {
        milliseconds: diffMs,
        seconds: diffSeconds,
        minutes: diffMinutes,
        hours: diffHours,
        days: diffDays,
      },
      date1: date1.toISOString(),
      date2: date2.toISOString(),
    };
  }

  /**
   * Convert timezone
   */
  private convertTimezone(form: DateTimeForm, inputDate: string): string {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${inputDate}`);
    }

    const targetTimezone = form.timezone || 'UTC';

    // For now, return the date in the target timezone format
    // In a full implementation, you'd use a proper timezone library
    return date.toLocaleString('en-US', { timeZone: targetTimezone });
  }
}

// Export singleton instance
export const dateTimeExecutor = new DateTimeExecutor();