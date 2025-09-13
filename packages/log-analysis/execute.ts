import {  FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';
import * as fs from 'fs';
import { LogAnalysisNodeData } from './types';

/**
 * Handler for executing Log Analysis nodes
 */
export async function executeLogAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as LogAnalysisNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from log path
  const inputs: string[] = [
    ...getInputFromTemplate(form.logPath || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for log analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'loganalysis',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    console.log(`Executing Log Analysis node: ${node.id} with analysis type: ${form.analysisType}`);

    const logPath = processTemplate(form.logPath || '', vars);
    
    if (!logPath) {
      throw new Error('Log path is required for log analysis');
    }

    const logContent = await fs.promises.readFile(logPath, 'utf8');
    let result: any;

    switch (form.analysisType) {
      case 'summary':
        result = await analyzeLogSummary(logContent, form);
        break;
      case 'errors':
        result = await analyzeLogErrors(logContent, form);
        break;
      case 'performance':
        result = await analyzeLogPerformance(logContent, form);
        break;
      default:
        throw new Error(`Unsupported log analysis type: ${form.analysisType}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`Log Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'loganalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'loganalysis';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'loganalysis',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Log analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown log analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Log analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'loganalysis',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

async function analyzeLogSummary(content: string, _form: any) {
  const lines = content.split('\n');
  const errorLines = lines.filter(line => 
    line.toLowerCase().includes('error') || 
    line.toLowerCase().includes('fatal') ||
    line.toLowerCase().includes('critical')
  );
  const warningLines = lines.filter(line => 
    line.toLowerCase().includes('warn') || 
    line.toLowerCase().includes('warning')
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

async function analyzeLogErrors(content: string, _form: any) {
  const lines = content.split('\n');
  const errorLines = lines.filter(line => 
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

async function analyzeLogPerformance(content: string, _form: any) {
  const lines = content.split('\n');
  const performanceLines = lines.filter(line => 
    line.includes('ms') || 
    line.includes('seconds') ||
    line.includes('response time')
  );
  
  return {
    totalPerformanceEntries: performanceLines.length,
    performanceData: performanceLines.slice(0, 10),
    slowQueries: performanceLines.filter(line => 
      line.includes('slow') || 
      line.includes('timeout')
    ),
  };
}

function extractErrorPatterns(errorLines: string[]) {
  const patterns: { [key: string]: number } = {};
  
  errorLines.forEach(line => {
    // Simple pattern extraction - look for common error keywords
    if (line.includes('connection')) patterns['connection'] = (patterns['connection'] || 0) + 1;
    if (line.includes('timeout')) patterns['timeout'] = (patterns['timeout'] || 0) + 1;
    if (line.includes('database')) patterns['database'] = (patterns['database'] || 0) + 1;
    if (line.includes('network')) patterns['network'] = (patterns['network'] || 0) + 1;
  });
  
  return patterns;
}
