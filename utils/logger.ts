/**
 * Logger utility for API calls and other debugging purposes
 */

// Configure log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Determine if we should show logs based on environment
const isDev = process.env.NODE_ENV !== 'production';

// Color codes for console output
const colors = {
  debug: '#6c757d',  // gray
  info: '#0d6efd',   // blue
  warn: '#ffc107',   // yellow
  error: '#dc3545',  // red
  success: '#198754', // green
  api: '#6610f2',    // purple
  response: '#20c997', // teal
  request: '#fd7e14'  // orange
};

/**
 * Log API request details
 */
export const logApiRequest = (method: string, url: string, headers?: Record<string, any>, body?: any) => {
  if (!isDev) return;

  const timestamp = new Date().toISOString();
  
  console.groupCollapsed(
    `%c🔶 API Request: ${method} ${url} [${timestamp}]`,
    `color: ${colors.api}; font-weight: bold;`
  );
  
  console.log('%cURL:', `color: ${colors.request}; font-weight: bold;`, url);
  console.log('%cMethod:', `color: ${colors.request}; font-weight: bold;`, method);
  
  if (headers) {
    console.log('%cHeaders:', `color: ${colors.request}; font-weight: bold;`, headers);
  }
  
  if (body) {
    console.log('%cBody:', `color: ${colors.request}; font-weight: bold;`, body);
  }
  
  console.groupEnd();
};

/**
 * Log API response details
 */
export const logApiResponse = (method: string, url: string, status: number, data: any, duration: number) => {
  if (!isDev) return;

  const isSuccess = status >= 200 && status < 300;
  const color = isSuccess ? colors.success : colors.error;
  
  console.groupCollapsed(
    `%c🔷 API Response: ${method} ${url} [${status}] (${duration}ms)`,
    `color: ${color}; font-weight: bold;`
  );
  
  console.log('%cURL:', `color: ${colors.response}; font-weight: bold;`, url);
  console.log('%cMethod:', `color: ${colors.response}; font-weight: bold;`, method);
  console.log('%cStatus:', `color: ${colors.response}; font-weight: bold;`, status);
  console.log('%cDuration:', `color: ${colors.response}; font-weight: bold;`, `${duration}ms`);
  console.log('%cData:', `color: ${colors.response}; font-weight: bold;`, data);
  
  console.groupEnd();
};

/**
 * Log API error details
 */
export const logApiError = (method: string, url: string, error: any, duration: number) => {
  if (!isDev) return;

  console.groupCollapsed(
    `%c❌ API Error: ${method} ${url} (${duration}ms)`,
    `color: ${colors.error}; font-weight: bold;`
  );
  
  console.log('%cURL:', `color: ${colors.error}; font-weight: bold;`, url);
  console.log('%cMethod:', `color: ${colors.error}; font-weight: bold;`, method);
  console.log('%cDuration:', `color: ${colors.error}; font-weight: bold;`, `${duration}ms`);
  console.error('%cError:', `color: ${colors.error}; font-weight: bold;`, error);
  
  console.groupEnd();
};

/**
 * General purpose logger
 */
export const log = (level: LogLevel, message: string, ...args: any[]) => {
  if (!isDev) return;
  
  const color = colors[level];
  
  switch (level) {
    case 'debug':
      console.debug(`%c${message}`, `color: ${color}`, ...args);
      break;
    case 'info':
      console.info(`%c${message}`, `color: ${color}`, ...args);
      break;
    case 'warn':
      console.warn(`%c${message}`, `color: ${color}`, ...args);
      break;
    case 'error':
      console.error(`%c${message}`, `color: ${color}`, ...args);
      break;
  }
};
