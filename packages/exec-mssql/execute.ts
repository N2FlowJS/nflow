import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { ExecMssqlNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '../@flow';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';

/**
 * Handler for executing Microsoft SQL Server nodes
 */
export async function executeExecMssqlNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ExecMssqlNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the query template
  const inputs: string[] = getInputFromTemplate(form.query || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for MSSQL query',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execmssql',
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
      throw new Error('No T-SQL query specified');
    }

    // Process the query template with variables
    const processedQuery = processTemplate(form.query, vars);
    
    console.log(`Executing MSSQL query: ${processedQuery}`);

    // Import mssql dynamically to avoid bundling issues
    const sql = await import('mssql');
    
    // Create database connection configuration
    const config = {
      server: form.server,
      port: form.port || 1433,
      user: form.user,
      password: form.password || '',
      database: form.database,
      connectionTimeout: (form.timeout || 30) * 1000,
      requestTimeout: (form.timeout || 30) * 1000,
      options: {
        trustServerCertificate: form.trustServerCertificate ?? true,
        enableArithAbort: true,
      },
    };

    let results: any;
    let pool: any;
    
    try {
      // Create connection pool
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      // Execute the query
      const request = pool.request();
      const result = await request.query(processedQuery);
      results = result.recordset;
      
      // Limit results if maxRows is specified
      if (form.maxRows && Array.isArray(results) && results.length > form.maxRows) {
        results = results.slice(0, form.maxRows);
      }
      
    } finally {
      // Always close the connection pool
      if (pool) {
        await pool.close();
      }
    }

    // Format results as JSON string
    const formattedResults = JSON.stringify(results, null, 2);
    
    console.log(`MSSQL query results: ${formattedResults}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedResults, 'execmssql');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = formattedResults;
      flowState.components[node.id]['type'] = 'execmssql';
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
        type: 'execmssql',
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
    console.error('MSSQL execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown MSSQL error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `MSSQL execution failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'execmssql',
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
