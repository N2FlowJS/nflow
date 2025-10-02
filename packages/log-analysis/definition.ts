import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

export const LogAnalysisNode: NodeDefinition = {
  id: 'log-analysis',
  name: 'Log Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyzes log files for summaries, errors, or performance metrics',
  version: '1.0.0',

  inputs: [
    {
      id: 'logPath',
      name: 'logPath',
      type: PortType.TEXT,
      description: 'Path to the log file',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: 'result',
      type: PortType.JSON,
      description: 'Analysis result',
    },
    {
      id: 'summary',
      name: 'summary',
      type: PortType.TEXT,
      description: 'Summary text',
    },
  ],

  getDynamicInputs: (config: any) => {
    if (!config.logPath) {
      return [];
    }
    
    const variableNames = getInputFromTemplate(config.logPath);
    return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { logPath: logPathTemplate, analysisType } = config;

    // Check if template variables are ready
    const templateVars = getInputFromTemplate(logPathTemplate || '');
    const missingVars = templateVars.filter(varName => !inputs[varName]);
    
    if (missingVars.length > 0) {
      // Return empty output if inputs are missing (graceful handling)
      return {
        outputs: {
          result: {},
          summary: '',
        },
        status: 'success',
        metadata: {
          waitingFor: missingVars,
          note: 'Some template variables are not provided',
        },
      };
    }

    try {
      // Process template
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        vars[key] = String(inputs[key] || '');
      });

      const logPath = processTemplate(logPathTemplate || '', vars);

      if (!logPath) {
        throw new Error('Log path is required for log analysis');
      }

      // Read log file
      const fs = await import('fs');
      const logContent = await fs.promises.readFile(logPath, 'utf8');

      // Perform analysis based on type
      let result: any;
      switch (analysisType) {
        case 'summary':
          result = await analyzeLogSummary(logContent);
          break;
        case 'errors':
          result = await analyzeLogErrors(logContent);
          break;
        case 'performance':
          result = await analyzeLogPerformance(logContent);
          break;
        default:
          throw new Error(`Unsupported log analysis type: ${analysisType}`);
      }

      const summary = generateSummaryText(result, analysisType);

      return {
        outputs: {
          result,
          summary,
        },
        status: 'success',
        metadata: {
          logPath,
          analysisType,
          ...result,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {},
        status: 'error',
        error: `Log analysis failed: ${errorMessage}`,
        metadata: {
          analysisType,
        },
      };
    }
  },
};

// Helper functions
async function analyzeLogSummary(content: string) {
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

async function analyzeLogErrors(content: string) {
  const lines = content.split('\n');
  const errorLines = lines.filter((line) =>
    line.toLowerCase().includes('error') ||
    line.toLowerCase().includes('fatal') ||
    line.toLowerCase().includes('critical')
  );

  return {
    totalErrors: errorLines.length,
    errors: errorLines.slice(0, 20), // First 20 errors
    errorPatterns: extractErrorPatterns(errorLines),
  };
}

async function analyzeLogPerformance(content: string) {
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

function extractErrorPatterns(errorLines: string[]) {
  const patterns: { [key: string]: number } = {};

  errorLines.forEach((line) => {
    if (line.includes('connection')) patterns['connection'] = (patterns['connection'] || 0) + 1;
    if (line.includes('timeout')) patterns['timeout'] = (patterns['timeout'] || 0) + 1;
    if (line.includes('database')) patterns['database'] = (patterns['database'] || 0) + 1;
    if (line.includes('network')) patterns['network'] = (patterns['network'] || 0) + 1;
  });

  return patterns;
}

function generateSummaryText(result: any, analysisType: string): string {
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
