import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

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
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.query as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { results: [], count: 0 },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      if (!config.server || !config.database || !config.user) {
        throw new Error('Missing required connection parameters');
      }

      if (!config.query || String(config.query).trim() === '') {
        throw new Error('No SQL query specified');
      }

      const processedQuery = processTemplate(config.query as string, vars);

      // Import mysql2 dynamically
      const mysql = await import('mysql2/promise');

      const connection = await mysql.createConnection({
        host: config.server as string,
        port: (config.port as number) || 3306,
        user: config.user as string,
        password: (config.password as string) || '',
        database: config.database as string,
        connectTimeout: ((config.timeout as number) || 30) * 1000,
      });

      let results: any;

      try {
        const [rows] = await connection.execute(processedQuery);
        results = rows;

        if (config.maxRows && Array.isArray(results) && results.length > (config.maxRows as number)) {
          results = results.slice(0, config.maxRows as number);
        }
      } finally {
        await connection.end();
      }

      const formattedResults = JSON.stringify(results, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, formattedResults, 'execmysql');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          results,
          count: Array.isArray(results) ? results.length : 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          rowCount: Array.isArray(results) ? results.length : 0,
          query: processedQuery
        }
      };
    } catch (error: unknown) {
      console.error('MySQL execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown MySQL error';

      return {
        outputs: {
          results: [],
          count: 0
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
