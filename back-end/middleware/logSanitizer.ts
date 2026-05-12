/**
 * Logger sanitizer to prevent API keys, passwords, and secrets from being logged.
 * 
 * Masks:
 * - Secret placeholders: {{SECRET_NAME}}
 * - Common patterns: "password=...", "token=...", "key=..."
 * - URLs with credentials: "https://user:pass@host.com"
 */

export class LogSanitizer {
  private static readonly SECRET_PATTERNS = [
    // {{SECRET_*}} placeholders
    /\{\{([A-Z_]+)\}\}/g,
    // password, apiKey, token, etc. in key=value format
    /\b(?:password|passwd|pwd|apikey|api_key|api-key|secret|token|authorization|auth_token|bearer|key|apiSecret|api_secret)\s*[:=]\s*[^\s,}";]+/gi,
    // URLs with credentials: https://user:pass@host
    /\/\/([^/]+):([^@]+)@/g,
    // JSON strings with sensitive keys
    /"(?:password|apiKey|secret|token|authorization|key)":\s*"[^"]*"/gi,
    // AWS keys
    /AKIA[0-9A-Z]{16}[0-9A-Za-z]{20}/g,
    // Connection strings
    /(?:mongodb|mysql|postgresql|mssql|postgres):\/\/[^/]+:[^@]+@/gi,
  ];

  /**
   * Sanitize a log message by masking secrets and sensitive data
   */
  static sanitize(message: string | any): string {
    if (!message) return '';
    let text = typeof message === 'string' ? message : JSON.stringify(message);

    return this.SECRET_PATTERNS.reduce((acc, pattern) => 
      acc.replace(pattern, (m) => m.length > 4 ? m[0] + '***' + m[m.length - 1] : '***'), 
      text
    );
  }

  /**
   * Sanitize error message for user consumption (remove implementation details)
   */
  static sanitizeError(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message || String(error);
    const sanitized = this.sanitize(message);

    // For user-facing errors, don't expose database names or file paths
    return sanitized
      .replace(/\/[a-zA-Z]:\/[^\s"]+/g, '{{file_path}}') // Windows paths
      .replace(/\/[^/\s"]*\/[^\s"]+/g, '{{path}}') // Unix paths
      .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '{{ip_address}}'); // IPs
  }

  /**
   * Safe JSON stringify that sanitizes all values
   */
  static stringifyWithMask(obj: any, space?: number): string {
    try {
      const json = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string') {
          // Check if this key looks sensitive
          if (/password|secret|token|key|auth|apikey|credential/i.test(key)) {
            return '***';
          }
          return this.sanitize(value);
        }
        return value;
      }, space);
      return json;
    } catch (err) {
      return this.sanitize(String(obj));
    }
  }

  /**
   * Create a safe logger function
   */
  static createSafeLogger(baseLog: (msg: string) => void) {
    return (msg: string | any) => {
      const sanitized = this.sanitize(msg);
      baseLog(sanitized);
    };
  }
}

/**
 * Global console override to sanitize logs (optional - use with caution)
 */
export function installGlobalLogSanitizer() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: any[]) => {
    const sanitized = args.map(arg => LogSanitizer.sanitize(arg));
    originalLog(...sanitized);
  };

  console.error = (...args: any[]) => {
    const sanitized = args.map(arg => LogSanitizer.sanitizeError(arg));
    originalError(...sanitized);
  };

  console.warn = (...args: any[]) => {
    const sanitized = args.map(arg => LogSanitizer.sanitize(arg));
    originalWarn(...sanitized);
  };
}
