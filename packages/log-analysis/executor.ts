import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { LogAnalysisForm } from './types';

export class LogAnalysisExecutor extends BaseNodeExecutor<LogAnalysisForm> {
  constructor() {
    super({
      nodeType: 'log-analysis',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['logPath'],
    });
  }

  protected async executeLogic(form: LogAnalysisForm, context: ExecutionContext): Promise<string> {
    const { logPath: logPathTemplate, analysisType } = form;

    if (!logPathTemplate) {
      throw new Error('Log path is required for log analysis');
    }

    // Process template
    const logPath = this.processTemplate(logPathTemplate, context);

    // Read log file
    const fs = await import('fs');
    const logContent = await fs.promises.readFile(logPath, 'utf8');

    // Perform analysis based on type
    let result: any;
    switch (analysisType) {
      case 'summary':
        result = await this.analyzeLogSummary(logContent);
        break;
      case 'errors':
        result = await this.analyzeLogErrors(logContent);
        break;
      case 'performance':
        result = await this.analyzeLogPerformance(logContent);
        break;
      default:
        throw new Error(`Unsupported log analysis type: ${analysisType}`);
    }

    const summary = this.generateSummaryText(result, analysisType);

    // Return structured result
    return JSON.stringify({
      result,
      summary,
      metadata: {
        logPath,
        analysisType,
        ...result,
      }
    });
  }

  private async analyzeLogSummary(content: string) {
    const lines = content.split('\n');
    const errorLines = lines.filter((line) =>
      line.toLowerCase().includes('error') ||
      line.toLowerCase().includes('fatal') ||
      line.toLowerCase().includes('critical')
    );
    const warningLines = lines.filter((line) =>
      line.toLowerCase().includes('warn') || line.toLowerCase().includes('warning')
    );

    return {
      totalLines: lines.length,
      errors: errorLines.length,
      warnings: warningLines.length,
      errorSample: errorLines.slice(0, 5),
      warningSample: warningLines.slice(0, 5),
      analysisDate: new Date().toISOString(),
    };
  }

  private async analyzeLogErrors(content: string) {
    const lines = content.split('\n');
    const errorLines = lines.filter((line) =>
      line.toLowerCase().includes('error') ||
      line.toLowerCase().includes('fatal') ||
      line.toLowerCase().includes('critical')
    );

    return {
      totalErrors: errorLines.length,
      errors: errorLines.slice(0, 20), // First 20 errors
      errorPatterns: this.extractErrorPatterns(errorLines),
    };
  }

  private async analyzeLogPerformance(content: string) {
    const lines = content.split('\n');
    const performanceLines = lines.filter((line) =>
      line.includes('ms') || line.includes('seconds') || line.includes('response time')
    );

    return {
      totalPerformanceEntries: performanceLines.length,
      performanceData: performanceLines.slice(0, 10),
      slowQueries: performanceLines.filter((line) => line.includes('slow') || line.includes('timeout')),
    };
  }

  private extractErrorPatterns(errorLines: string[]) {
    const patterns: { [key: string]: number } = {};

    errorLines.forEach((line) => {
      if (line.includes('connection')) patterns['connection'] = (patterns['connection'] || 0) + 1;
      if (line.includes('timeout')) patterns['timeout'] = (patterns['timeout'] || 0) + 1;
      if (line.includes('database')) patterns['database'] = (patterns['database'] || 0) + 1;
      if (line.includes('network')) patterns['network'] = (patterns['network'] || 0) + 1;
    });

    return patterns;
  }

  private generateSummaryText(result: any, analysisType: string): string {
    switch (analysisType) {
      case 'summary':
        return `Total lines: ${result.totalLines}, Errors: ${result.errors}, Warnings: ${result.warnings}`;
      case 'errors':
        return `Total errors: ${result.totalErrors}, Patterns: ${Object.keys(result.errorPatterns).join(', ')}`;
      case 'performance':
        return `Performance entries: ${result.totalPerformanceEntries}, Slow queries: ${result.slowQueries.length}`;
      default:
        return JSON.stringify(result);
    }
  }
}

export const logAnalysisExecutor = new LogAnalysisExecutor();
