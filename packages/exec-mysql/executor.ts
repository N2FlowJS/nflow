/**
 * MySQL Executor - Refactored using BaseDatabaseExecutor
 * Executes SQL queries against MySQL databases
 */

import { BaseDatabaseExecutor } from '../@node-plugin/base-database-executor';
import { ExecMysqlForm } from './types';
import mysql from 'mysql2/promise';

/**
 * MySQL Executor
 */
export class ExecMysqlExecutor extends BaseDatabaseExecutor<ExecMysqlForm> {
  constructor() {
    super({
      nodeType: 'execmysql',
      defaultRole: 'developer',
      checkInputReadiness: true,
    });
  }

  /**
   * Execute MySQL query
   */
  protected async executeQuery(form: ExecMysqlForm, query: string): Promise<any> {
    // Create database connection
    const connection = await mysql.createConnection({
      host: form.server,
      port: form.port || 3306,
      user: form.user,
      password: form.password || '',
      database: form.database,
      connectTimeout: (form.timeout || 30) * 1000, // Convert to milliseconds
    });

    try {
      // Execute the query
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      // Always close the connection
      await connection.end();
    }
  }

  /**
   * Get database type for logging
   */
  protected getDbType(): string {
    return 'MySQL';
  }
}

// Export singleton instance
export const execMysqlExecutor = new ExecMysqlExecutor();