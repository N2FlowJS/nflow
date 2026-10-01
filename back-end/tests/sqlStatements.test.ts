import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { splitSqlStatements } from '../lib/sqlStatements';

describe('splitSqlStatements', () => {
  it('splits plain statements on semicolons', () => {
    expect(splitSqlStatements('SELECT 1; SELECT 2;')).toEqual(['SELECT 1', 'SELECT 2']);
  });

  it('drops trailing and empty statements', () => {
    expect(splitSqlStatements('SELECT 1;;\n\n  ;  ')).toEqual(['SELECT 1']);
  });

  it('ignores semicolons inside single-quoted literals', () => {
    expect(splitSqlStatements("INSERT INTO t VALUES ('a;b');")).toEqual([
      "INSERT INTO t VALUES ('a;b')",
    ]);
  });

  it('handles doubled quotes inside single-quoted literals', () => {
    expect(splitSqlStatements("SELECT 'it''s; fine';")).toEqual(["SELECT 'it''s; fine'"]);
  });

  it('ignores semicolons inside double-quoted identifiers', () => {
    expect(splitSqlStatements('SELECT "weird;col" FROM t;')).toEqual([
      'SELECT "weird;col" FROM t',
    ]);
  });

  it('handles doubled double quotes inside identifiers', () => {
    expect(splitSqlStatements('SELECT "a""b;c" FROM t;')).toEqual(['SELECT "a""b;c" FROM t']);
  });

  it('ignores semicolons inside dollar-quoted bodies', () => {
    const body = 'CREATE FUNCTION f() RETURNS trigger AS $$ BEGIN NEW.x = 1; RETURN NEW; END; $$ LANGUAGE plpgsql';
    expect(splitSqlStatements(`${body};`)).toEqual([body]);
  });

  it('ignores semicolons inside tagged dollar-quoted bodies', () => {
    const body = 'DO $body$ BEGIN PERFORM 1; PERFORM 2; END $body$';
    expect(splitSqlStatements(`${body};`)).toEqual([body]);
  });

  it('strips line comments', () => {
    const sql = '-- a comment; with a semicolon\nSELECT 1;';
    expect(splitSqlStatements(sql)).toEqual(['SELECT 1']);
  });

  it('strips block comments', () => {
    const sql = '/* a; comment */ SELECT 1;';
    expect(splitSqlStatements(sql)).toEqual(['SELECT 1']);
  });

  it('splits the real init migration into individual statements', () => {
    const file = path.resolve(__dirname, '..', 'migrations', '0001_init.sql');
    const statements = splitSqlStatements(fs.readFileSync(file, 'utf8'));

    // Every statement must be independently executable, so the trigger
    // function's dollar-quoted body must survive intact in one piece.
    const createFunction = statements.find((s) => s.startsWith('CREATE OR REPLACE FUNCTION'));
    expect(createFunction).toBeDefined();
    expect(createFunction).toContain('RETURN NEW;');
    expect(createFunction).toContain('$$ LANGUAGE plpgsql');

    const tables = statements.filter((s) => /^CREATE TABLE/.test(s));
    expect(tables).toHaveLength(5);
    for (const table of ['users', 'flows', 'flow_executions', 'user_secrets', 'llm_providers']) {
      expect(tables.some((t) => t.includes(`"${table}"`))).toBe(true);
    }

    // Foreign keys are added in a single trailing DO block.
    const doBlock = statements[statements.length - 1] ?? '';
    expect(doBlock.startsWith('DO $$')).toBe(true);
    for (const fk of [
      'flows_userId_fkey',
      'flow_executions_flowId_fkey',
      'user_secrets_userId_fkey',
      'llm_providers_userId_fkey',
    ]) {
      expect(doBlock).toContain(fk);
    }

    // No statement should still carry a statement terminator.
    expect(statements.every((s) => !s.endsWith(';'))).toBe(true);
  });
});
