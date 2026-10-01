/**
 * Splits a SQL script into individual statements.
 *
 * The an5 adapter's Postgres engine always calls `pool.query(text, values)`
 * with a (possibly empty) `values` array, which makes `pg` use the extended
 * query protocol. That protocol accepts exactly one statement per call, so
 * migration scripts have to be split before they are sent.
 *
 * Handles single-quoted literals (with `''` escapes), double-quoted
 * identifiers (with `""` escapes), dollar-quoted bodies (`$$` / `$tag$`),
 * `--` line comments and `/* *\/` block comments.
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let i = 0;

  const pushCurrent = (): void => {
    const trimmed = current.trim();
    if (trimmed) statements.push(trimmed);
    current = '';
  };

  while (i < sql.length) {
    const rest = sql.slice(i);

    // -- line comment
    if (rest.startsWith('--')) {
      const newline = sql.indexOf('\n', i);
      i = newline === -1 ? sql.length : newline;
      continue;
    }

    // /* block comment */
    if (rest.startsWith('/*')) {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }

    // 'string literal'
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (sql[j] === "'") break;
        j += 1;
      }
      current += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    // "quoted identifier"
    if (sql[i] === '"') {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === '"' && sql[j + 1] === '"') {
          j += 2;
          continue;
        }
        if (sql[j] === '"') break;
        j += 1;
      }
      current += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    // $tag$ ... $tag$ dollar-quoted body
    const tag = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(rest);
    if (tag) {
      const marker = tag[0];
      const end = sql.indexOf(marker, i + marker.length);
      const stop = end === -1 ? sql.length : end + marker.length;
      current += sql.slice(i, stop);
      i = stop;
      continue;
    }

    if (sql[i] === ';') {
      pushCurrent();
      i += 1;
      continue;
    }

    current += sql[i];
    i += 1;
  }

  pushCurrent();
  return statements;
}
