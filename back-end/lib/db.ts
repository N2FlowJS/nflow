import 'dotenv/config';
import { createAn5Adapter, setAdapterMetadata, type TypedAn5Adapter } from '@an5/adapters';
import { createLogger } from '../utils/logger';
import { modelFields, modelToTable, relationMap } from '../an5Client/typescript/an5Metadata';
import type { UserTableClient } from '../an5Client/typescript/User';
import type { FlowTableClient } from '../an5Client/typescript/Flow';
import type { FlowExecutionTableClient } from '../an5Client/typescript/FlowExecution';
import type { UserSecretTableClient } from '../an5Client/typescript/UserSecret';
import type { LLMProviderTableClient } from '../an5Client/typescript/LLMProvider';

const logger = createLogger('Database');

/**
 * The an5 metadata generator always renders a schema-qualified, T-SQL quoted
 * table name (`[public].[flows]`). N2Flow runs on PostgreSQL, which does not
 * understand square brackets, so the names are re-quoted here.
 *
 * The adapter emits a table name verbatim as soon as it starts with a quote
 * character, so `"public"."flows"` is passed straight through to `pg`.
 */
function requoteForPostgres(qualifiedName: string): string {
  return qualifiedName
    .replace(/[[\]]/g, '')
    .split('.')
    .map((part) => `"${part.replace(/"/g, '""')}"`)
    .join('.');
}

const postgresModelToTable = Object.fromEntries(
  Object.entries(modelToTable).map(([model, table]) => [model, requoteForPostgres(table)]),
);

setAdapterMetadata({
  modelToTable: postgresModelToTable,
  modelFields,
  relationMap,
});

type N2FlowModels = {
  user: UserTableClient;
  flow: FlowTableClient;
  flowExecution: FlowExecutionTableClient;
  userSecret: UserSecretTableClient;
  llmProvider: LLMProviderTableClient;
};

export type Db = TypedAn5Adapter<N2FlowModels>;

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize the database client');
  }

  logger.debug(`DATABASE_URL set: ${!!connectionString}`);
  logger.debug(`DATABASE_URL (masked): ${connectionString.replace(/:\/\/([^@]+)@/, '://***@')}`);

  return createAn5Adapter<N2FlowModels>({ connectionString });
}

declare global {
  var db: Db | undefined;
}

function resolveDb(): Db {
  if (process.env.NODE_ENV === 'production') {
    return createDb();
  }
  // Avoid opening a new connection pool on every reload in development.
  if (!globalThis.db) {
    globalThis.db = createDb();
  }
  return globalThis.db;
}

export const db: Db = resolveDb();
