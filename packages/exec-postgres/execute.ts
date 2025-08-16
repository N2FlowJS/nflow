import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { ExecPostgresNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { Client } from 'pg';

/**
 * Handler for executing PostgreSQL nodes
 */
export async function executeExecPostgresNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ExecPostgresNodeData;
  const form = data.form || {} as ExecPostgresNodeData['form'];
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.query || '');
  const ready = isNodeReady(inputs, flowState);
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for PostgreSQL query',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execpostgres',
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

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = (flowState.components[key].output as string) || '';
    }
  });

  try {
    if (!form.server || !form.database || !form.user) {
      throw new Error('Missing required database connection parameters (server, database, user)');
    }
    if (!form.query || form.query.trim() === '') {
      throw new Error('No SQL query specified');
    }

    const processedQuery = processTemplate(form.query, vars);
    console.log(`Executing PostgreSQL query: ${processedQuery}`);

    const client = new Client({
      host: form.server,
      port: form.port || 5432,
      user: form.user,
      password: form.password || '',
      database: form.database,
      ssl: form.ssl ? { rejectUnauthorized: false } : undefined,
      statement_timeout: (form.timeout || 30) * 1000,
    });

    await client.connect();

    let results: any;
    try {
      const res = await client.query(processedQuery);
      results = res.rows;
      if (form.maxRows && Array.isArray(results) && results.length > form.maxRows) {
        results = results.slice(0, form.maxRows);
      }
    } finally {
      await client.end();
    }

    const formattedResults = JSON.stringify(results, null, 2);
    console.log(`PostgreSQL query results: ${formattedResults}`);

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedResults, 'execpostgres');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = formattedResults;
      flowState.components[node.id]['type'] = 'execpostgres';
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
        type: 'execpostgres',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedResults,
      },
    };
  } catch (error: unknown) {
    console.error('PostgreSQL execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown PostgreSQL error';
    return {
      nextNodes: [],
      status: 'error',
      message: `PostgreSQL execution failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execpostgres',
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
