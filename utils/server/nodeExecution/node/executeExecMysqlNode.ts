import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { ExecMysqlNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';
import mysql from 'mysql2/promise';

/**
 * Handler for executing MySQL nodes
 */
export async function executeExecMysqlNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ExecMysqlNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the query template
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for MySQL query',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execmysql',
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
    // Validate required connection parameters
    if (!form.server || !form.database || !form.user) {
      throw new Error('Missing required database connection parameters (server, database, user)');
    }

    if (!form.query || form.query.trim() === '') {
      throw new Error('No SQL query specified');
    }

    // Process the query template with variables
    const processedQuery = processTemplate(form.query, vars);
    
    console.log(`Executing MySQL query: ${processedQuery}`);

    // Create database connection
    const connection = await mysql.createConnection({
      host: form.server,
      port: form.port || 3306,
      user: form.user,
      password: form.password || '',
      database: form.database,
      connectTimeout: (form.timeout || 30) * 1000, // Convert to milliseconds
    });

    let results: any;
    
    try {
      // Execute the query with timeout
      const [rows] = await connection.execute(processedQuery);
      results = rows;
      
      // Limit results if maxRows is specified
      if (form.maxRows && Array.isArray(results) && results.length > form.maxRows) {
        results = results.slice(0, form.maxRows);
      }
      
    } finally {
      // Always close the connection
      await connection.end();
    }

    // Format results as JSON string
    const formattedResults = JSON.stringify(results, null, 2);
    
    console.log(`MySQL query results: ${formattedResults}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedResults, 'execmysql');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = formattedResults;
      flowState.components[node.id]['type'] = 'execmysql';
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
        type: 'execmysql',
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
    console.error('MySQL execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown MySQL error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `MySQL execution failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execmysql',
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
