import { BaseNodeExecutor, ExecutionContext, ExecutorConfig } from '../@node-plugin/base-executor';

/**
 * Database Connection Configuration
 */
export interface DatabaseConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timeout?: number;
}

/**
 * Base Database Executor
 * 
 * Extends BaseNodeExecutor with database operation capabilities.
 * Provides common connection management, query execution, and result formatting.
 */
export abstract class BaseDatabaseExecutor<TForm extends { query: string; maxRows?: number }> extends BaseNodeExecutor<TForm> {
  constructor(config: ExecutorConfig) {
    super({
      ...config,
      templateFields: ['query', ...(config.templateFields || [])],
    });
  }

  /**
   * Execute database logic - connect, query, format results
   */
  protected async executeLogic(
    form: TForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate connection parameters
    this.validateConnectionParams(form);

    // Validate query
    if (!form.query || form.query.trim() === '') {
      throw new Error('No SQL query specified');
    }

    // Process query template
    const processedQuery = this.processTemplate(form.query, context);

    console.log(`Executing ${this.getDbType()} query: ${processedQuery}`);

    // Execute database-specific query
    let results = await this.executeQuery(form, processedQuery);

    // Limit results if maxRows is specified
    if (form.maxRows && Array.isArray(results) && results.length > form.maxRows) {
      results = results.slice(0, form.maxRows);
    }

    // Format results as JSON
    const formattedResults = JSON.stringify(results, null, 2);

    console.log(`${this.getDbType()} query results: ${formattedResults}`);

    return formattedResults;
  }

  /**
   * Validate database connection parameters
   * Override in subclass for database-specific validation
   */
  protected validateConnectionParams(form: any): void {
    if (!form.server || !form.database || !form.user) {
      throw new Error('Missing required database connection parameters (server, database, user)');
    }
  }

  /**
   * Execute database-specific query
   * Must be implemented by subclass
   */
  protected abstract executeQuery(form: TForm, query: string): Promise<any>;

  /**
   * Get database type name for logging
   * Override in subclass
   */
  protected abstract getDbType(): string;
}
