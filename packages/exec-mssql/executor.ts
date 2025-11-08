import { BaseDatabaseExecutor } from '../@node-plugin/base-database-executor';
import { ExecMssqlForm } from './types';

/**
 * MSSQL Executor
 * 
 * Executes T-SQL queries against Microsoft SQL Server databases.
 */
export class ExecMssqlExecutor extends BaseDatabaseExecutor<ExecMssqlForm> {
  constructor() {
    super({
      nodeType: 'execmssql',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [], // query is added by parent
    });
  }

  /**
   * Execute MSSQL query
   */
  protected async executeQuery(form: ExecMssqlForm, processedQuery: string): Promise<any> {
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

    let pool: any;

    try {
      // Create connection pool
      pool = new sql.ConnectionPool(config);
      await pool.connect();

      // Execute the query
      const request = pool.request();
      const result = await request.query(processedQuery);
      
      return result.recordset;
    } finally {
      // Always close the connection pool
      if (pool) {
        await pool.close();
      }
    }
  }

  /**
   * Get database type name
   */
  protected getDbType(): string {
    return 'MSSQL';
  }
}

// Export singleton instance
export const execMssqlExecutor = new ExecMssqlExecutor();
