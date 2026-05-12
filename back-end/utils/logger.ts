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

  private static readonly LEVEL_VALUES: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  private static readonly CONSOLE_FNS: Record<LogLevel, (s: string) => void> = {
    [LogLevel.DEBUG]: console.debug.bind(console),
    [LogLevel.INFO]: console.log.bind(console),
    [LogLevel.WARN]: console.warn.bind(console),
    [LogLevel.ERROR]: console.error.bind(console),
  };

  static setMinLevel(level: LogLevel) {
    Logger.minLevel = level;
  }

  private static shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_VALUES[level] >= Logger.LEVEL_VALUES[Logger.minLevel];
  }

  private static formatEntry(entry: LogEntry): string {
    const { timestamp, level, module, message, data, error } = entry;
    let output = `[${timestamp}] [${level}] [${module}] ${message}`;
    if (data) output += ` | Data: ${JSON.stringify(data)}`;
    if (error) output += ` | Error: ${error}`;
    return output;
  }

  private static emit(level: LogLevel, moduleName: string, message: string, data?: unknown, errorMsg?: string) {
    if (!Logger.shouldLog(level)) return;
    Logger.CONSOLE_FNS[level](Logger.formatEntry({
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message,
      data,
      error: errorMsg,
    }));
  }

  static createLogger(moduleName: string) {
    return {
      debug: (message: string, data?: unknown) => Logger.emit(LogLevel.DEBUG, moduleName, message, data),
      info:  (message: string, data?: unknown) => Logger.emit(LogLevel.INFO,  moduleName, message, data),
      warn:  (message: string, data?: unknown) => Logger.emit(LogLevel.WARN,  moduleName, message, data),
      error: (message: string, error?: unknown, data?: unknown) =>
        Logger.emit(LogLevel.ERROR, moduleName, message, data,
          error instanceof Error ? error.message : String(error)),
    };
  }
}

// Export convenience logger factory
export const createLogger = (moduleName: string) => Logger.createLogger(moduleName);
