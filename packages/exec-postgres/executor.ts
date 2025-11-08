import { BaseDatabaseExecutor } from '../@node-plugin/base-database-executor';
import { ExecPostgresForm } from './types';
import { Client } from 'pg';

/**
 * PostgreSQL Executor
 * 
 * Executes SQL queries against PostgreSQL databases.
 */
export class ExecPostgresExecutor extends BaseDatabaseExecutor<ExecPostgresForm> {
  constructor() {
    super({
      nodeType: 'execpostgres',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [], // query is added by parent
    });
  }

  /**
   * Execute PostgreSQL query
   */
  protected async executeQuery(form: ExecPostgresForm, processedQuery: string): Promise<any> {
    const client = new Client({
      host: form.server,
      port: form.port || 5432,
      user: form.user,
      password: form.password || '',
      database: form.database,
      ssl: form.ssl ? { rejectUnauthorized: false } : undefined,
      statement_timeout: (form.timeout || 30) * 1000,
    });

    try {
      await client.connect();
      const res = await client.query(processedQuery);
      return res.rows;
    } finally {
      await client.end();
    }
  }

  /**
   * Get database type name
   */
  protected getDbType(): string {
    return 'PostgreSQL';
  }
}

// Export singleton instance
export const execPostgresExecutor = new ExecPostgresExecutor();
