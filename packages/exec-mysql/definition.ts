import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { ExecMysqlForm } from './types';
import { execMysqlExecutor } from './executor';

/**
 * MySQL Execute Node Definition
 * 
 * Execute SQL queries on MySQL/MariaDB databases.
 * Supports parameterized queries via template variables.
 * 
 * Configuration:
 * - server: Database host
 * - port: Database port (default: 3306)
 * - database: Database name
 * - user: Database user
 * - password: Database password
 * - query: SQL query (supports {variable} templates)
 * - timeout: Query timeout in seconds (default: 30)
 * - maxRows: Maximum rows to return (optional)
 * 
 * Security:
 * - Use template variables for dynamic values
 * - Avoid string concatenation (SQL injection risk)
 * - Set appropriate timeouts
 * - Limit result size with maxRows
 * 
 * Example:
 * ```json
 * {
 *   "server": "localhost",
 *   "database": "mydb",
 *   "user": "root",
 *   "query": "SELECT * FROM users WHERE id = {userId}",
 *   "maxRows": 100
 * }
 * ```
 */
export const ExecMysqlNodeDefinition: NodeDefinition = {
  id: 'exec-mysql',
  name: 'MySQL Execute',
  category: NodeCategory.DATABASE,
  description: 'Execute SQL queries on MySQL/MariaDB databases',
  version: '1.0.0',

  inputs: [
    {
      id: 'server',
      name: 'Server',
      type: PortType.TEXT,
      description: 'Database host address',
      required: true,
      defaultValue: 'localhost',
      metadata: { inputType: 'text', placeholder: 'localhost' },
    },
    {
      id: 'port',
      name: 'Port',
      type: PortType.NUMBER,
      description: 'Database port',
      required: false,
      defaultValue: 3306,
      metadata: { inputType: 'number', min: 1, max: 65535 },
    },
    {
      id: 'database',
      name: 'Database',
      type: PortType.TEXT,
      description: 'Database name',
      required: true,
      metadata: { inputType: 'text', placeholder: 'mydb' },
    },
    {
      id: 'user',
      name: 'User',
      type: PortType.TEXT,
      description: 'Database user',
      required: true,
      metadata: { inputType: 'text', placeholder: 'root' },
    },
    {
      id: 'password',
      name: 'Password',
      type: PortType.TEXT,
      description: 'Database password',
      required: false,
      metadata: { inputType: 'text', placeholder: 'password' },
    },
    {
      id: 'query',
      name: 'SQL Query',
      type: PortType.TEXT,
      description: 'SQL query (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'textarea', rows: 6, placeholder: 'SELECT * FROM users WHERE id = {userId}' },
    },
    {
      id: 'timeout',
      name: 'Timeout (seconds)',
      type: PortType.NUMBER,
      description: 'Query timeout',
      required: false,
      defaultValue: 30,
      metadata: { inputType: 'number', min: 1, max: 300 },
    },
    {
      id: 'maxRows',
      name: 'Max Rows',
      type: PortType.NUMBER,
      description: 'Maximum rows to return (optional)',
      required: false,
      metadata: { inputType: 'number', min: 1 },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'results',
      name: 'Query Results',
      type: PortType.JSON,
      description: 'Query result rows',
    },
    {
      id: 'count',
      name: 'Row Count',
      type: PortType.NUMBER,
      description: 'Number of rows returned',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.query) {
      getInputFromTemplate(config.query as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `SQL parameter: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...ExecMysqlNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { node, flowState, dispatcher } = context;
    
    // Convert to FlowExecutionContext format expected by BaseNodeExecutor
    const flowExecutionContext = { 
      flow: { nodes: [], edges: [] }, 
      flowState,
      input: { role: 'user' as const, content: '' } // Empty input for now
    };
    
    // Execute using the BaseNodeExecutor
    const result = await execMysqlExecutor.execute(node, flowExecutionContext, dispatcher);
    
    // Convert ExecutionResult to NodeExecutionResult format
    const statusMap: Record<string, 'success' | 'error' | 'in_progress'> = {
      'ended': 'success',
      'error': 'error',
      'in_progress': 'in_progress',
      'waiting': 'in_progress',
      'token': 'in_progress',
      'add_message': 'in_progress'
    };
    
    // Parse the JSON result back to object for the outputs
    let results: any[] = [];
    let count = 0;
    try {
      results = JSON.parse(result.execution?.output || '[]');
      count = Array.isArray(results) ? results.length : 0;
    } catch {
      // If parsing fails, keep as empty array
    }
    
    return {
      outputs: {
        results,
        count
      },
      status: statusMap[result.status] || 'in_progress',
      metadata: {
        startTime: result.execution?.startTime,
        endTime: result.execution?.endTime,
        rowCount: count,
      },
    };
  }
};
