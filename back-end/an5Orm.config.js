/**
 * an5 ORM configuration.
 *
 * `schemaDir` is the source of truth for the data model (one `.an5` file per
 * model). `npm run db:generate` reads those files and writes the typed
 * TypeScript client into `an5Client/typescript`, which is committed to git so
 * builds and CI do not depend on the generator.
 *
 * Note: the `.an5` type vocabulary is SQL Server shaped (NVARCHAR, DATETIME2).
 * N2Flow runs on PostgreSQL, so the DDL is maintained by hand in
 * `migrations/` and the generated table names are re-quoted for Postgres at
 * runtime in `lib/db.ts`.
 */
module.exports = {
  schemaDir: 'an5Schema',

  outputs: {
    typescript: {
      outputDir: 'an5Client/typescript',
      metadataFile: 'an5Client/typescript/an5Metadata.ts',
    },
  },

  generation: {
    generateComments: true,
    generateMetadata: true,
  },
};
