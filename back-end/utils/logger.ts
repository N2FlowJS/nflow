/**
 * Centralized logging service for N2Flow
 * Replaces direct console.log calls to enable:
 * - Log level filtering
 * - Structured logging
 * - Log sanitization for sensitive data
 * - Easy migration to external services (ELK, Datadog, etc.)
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  error?: string;
}

export class Logger {
  private static minLevel = LogLevel.INFO;

  /**
   * Set minimum log level for filtering
   */
  static setMinLevel(level: LogLevel) {
    Logger.minLevel = level;
  }

  /**
   * Get numeric value of log level for comparison
   */
  private static getLevelValue(level: LogLevel): number {
    const levels: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };
    return levels[level];
  }

  /**
   * Check if log should be output based on level
   */
  private static shouldLog(level: LogLevel): boolean {
    return Logger.getLevelValue(level) >= Logger.getLevelValue(Logger.minLevel);
  }

  /**
   * Format log entry for output
   */
  private static formatEntry(entry: LogEntry): string {
    const { timestamp, level, module, message, data, error } = entry;
    let output = `[${timestamp}] [${level}] [${module}] ${message}`;
    
    if (data) {
      output += ` | Data: ${JSON.stringify(data)}`;
    }
    if (error) {
      output += ` | Error: ${error}`;
    }
    
    return output;
  }

  /**
   * Output log to console based on level
   */
  private static output(entry: LogEntry) {
    const formatted = Logger.formatEntry(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  /**
   * Create logger for a specific module
   */
  static createLogger(moduleName: string) {
    return {
      debug: (message: string, data?: unknown) => {
        if (Logger.shouldLog(LogLevel.DEBUG)) {
          Logger.output({
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            module: moduleName,
            message,
            data,
          });
        }
      },
      info: (message: string, data?: unknown) => {
        if (Logger.shouldLog(LogLevel.INFO)) {
          Logger.output({
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            module: moduleName,
            message,
            data,
          });
        }
      },
      warn: (message: string, data?: unknown) => {
        if (Logger.shouldLog(LogLevel.WARN)) {
          Logger.output({
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            module: moduleName,
            message,
            data,
          });
        }
      },
      error: (message: string, error?: Error | unknown, data?: unknown) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Logger.output({
          timestamp: new Date().toISOString(),
          level: LogLevel.ERROR,
          module: moduleName,
          message,
          data,
          error: errorMsg,
        });
      },
    };
  }
}

// Export convenience logger factory
export const createLogger = (moduleName: string) => Logger.createLogger(moduleName);
