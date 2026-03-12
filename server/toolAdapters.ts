import sql from 'mssql';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { Script, createContext } from 'node:vm';
import { runEmbeddingByProvider } from './llmAdapters';
import type { FlowNode } from './flowTypes';

const getNodeFieldValue = (
  node: FlowNode | undefined,
  key: string,
): string | number | boolean | undefined => {
  const configValue = node?.data?.configSchema?.find((field) => field.name === key)?.value;
  if (configValue !== undefined) return configValue;
  return node?.data?.params?.[key] as string | number | boolean | undefined;
};

export type ToolDefinition = {
  type: 'tool';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  nodeId: string;
  embeddingModel?: {
    kind: 'llm_embedding';
    provider?: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };
};

const trimTrailingSlash = (url: unknown) => String(url || '').replace(/\/+$/, '');

const runMssqlQuery = async (config: {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  timeoutMs: number;
  maxRows: number;
  query: string;
}) => {
  let pool: sql.ConnectionPool | null = null;
  const startedAt = Date.now();
  try {
    pool = await sql.connect({
      server: config.server,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionTimeout: config.timeoutMs,
      requestTimeout: config.timeoutMs,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: config.trustServerCertificate,
      },
    });

    const result = await pool.request().query(String(config.query));
    const normalizedMaxRows = Math.max(1, Math.min(2000, Number(config.maxRows) || 200));
    const rows = Array.isArray(result.recordset)
      ? result.recordset.slice(0, normalizedMaxRows)
      : [];

    return {
      rowCount: rows.length,
      totalRowCount: Array.isArray(result.recordset) ? result.recordset.length : 0,
      maxRows: normalizedMaxRows,
      durationMs: Date.now() - startedAt,
      rows,
    };
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {
      }
    }
  }
};

const interpolate = (template: string, values: Record<string, string>) =>
  String(template || '').replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, key) => {
    const value = values[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });

const parseJsonSafely = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const serializeToolResult = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const executeJsTool = (code: string, input: string, args: Record<string, string>): string => {
  if (!code.trim()) {
    return 'Error: JavaScript code is empty. Set the "code" parameter in JS Code node.';
  }

  const sandbox: Record<string, unknown> = {
    input,
    args,
    output: undefined,
    JSON,
    Math,
    Date,
  };

  const context = createContext(sandbox);
  const wrapped = `(function(input, args){\n${code}\n})`;

  try {
    const script = new Script(wrapped);
    const fn = script.runInContext(context, { timeout: 1500 });
    const result = typeof fn === 'function' ? fn(input, args) : undefined;
    const finalResult = result === undefined ? sandbox.output : result;
    return serializeToolResult(finalResult);
  } catch (err) {
    return `Error executing JS code: ${String(err)}`;
  }
};

const compactElasticSource = (source: unknown, vectorField: string): Record<string, unknown> => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return { value: source };
  }

  const vectorFieldLower = String(vectorField || '').toLowerCase();

  const sanitize = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const isLargeNumericArray = value.length > 32 && value.every((item) => typeof item === 'number');
      if (isLargeNumericArray) return undefined;
      return value
        .map((item) => sanitize(item))
        .filter((item) => item !== undefined);
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const rawObj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    Object.entries(rawObj).forEach(([key, nestedValue]) => {
      const keyLower = key.toLowerCase();
      const isVectorLikeKey =
        keyLower === vectorFieldLower ||
        keyLower.includes('embedding') ||
        keyLower.includes('vector');
      if (isVectorLikeKey) return;

      const sanitized = sanitize(nestedValue);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    });

    return result;
  };

  return (sanitize(source) as Record<string, unknown>) || {};
};

export const executeToolNode = async (
  node: FlowNode,
  args: Record<string, string>,
  options: {
    toolDef?: ToolDefinition;
    apiKey?: string;
    log: (msg: string) => void;
  },
): Promise<string> => {
  const { toolDef, apiKey, log } = options;
  log(`[Tool: ${node?.data?.label || node?.id}] Executing with args: ${JSON.stringify(args)}`);

  switch (node?.data?.type) {
    case 'MSSQLPyODBCComponent': {
      const queryTemplate = String(getNodeFieldValue(node, 'query') || '');
      const query = queryTemplate ? interpolate(queryTemplate, args) : (args.query || '');
      if (!query) return 'Error: SQL query is empty. Set Query Template or provide tool input.';

      const body = {
        server: getNodeFieldValue(node, 'server') || getNodeFieldValue(node, 'host') || '',
        port: Number(getNodeFieldValue(node, 'port') || 1433),
        user: getNodeFieldValue(node, 'user') || '',
        password: getNodeFieldValue(node, 'password') || '',
        database: getNodeFieldValue(node, 'database') || '',
        encrypt: String(getNodeFieldValue(node, 'encrypt') ?? 'false') === 'true',
        trustServerCertificate: String(getNodeFieldValue(node, 'trustServerCertificate') ?? 'true') === 'true',
        timeoutMs: Number(getNodeFieldValue(node, 'timeoutMs') || 30000),
        maxRows: Number(getNodeFieldValue(node, 'maxRows') || 200),
        query,
      };

      if (!body.server || !body.user || !body.database) {
        return 'Error: Missing DB config (server/user/database). Open MSSQL node parameters.';
      }

      try {
        const payload = await runMssqlQuery({
          server: String(body.server),
          port: Number(body.port),
          user: String(body.user),
          password: String(body.password),
          database: String(body.database),
          encrypt: Boolean(body.encrypt),
          trustServerCertificate: Boolean(body.trustServerCertificate),
          timeoutMs: Number(body.timeoutMs),
          maxRows: Number(body.maxRows),
          query: String(body.query),
        });
        return JSON.stringify({
          rowCount: payload?.rowCount || 0,
          totalRowCount: payload?.totalRowCount || payload?.rowCount || 0,
          maxRows: payload?.maxRows || body.maxRows,
          durationMs: payload?.durationMs,
          rows: Array.isArray(payload?.rows) ? payload.rows : [],
        });
      } catch (err) {
        return `Error executing MSSQL query: ${String(err)}`;
      }
    }

    case 'elasticsearch_search': {
      const endpoint = String(getNodeFieldValue(node, 'endpoint') || '');
      const index = String(getNodeFieldValue(node, 'index') || '');
      const vectorField = String(getNodeFieldValue(node, 'vectorField') || 'embedding');
      const esApiKey = String(getNodeFieldValue(node, 'apiKey') || '');
      if (!endpoint) return 'Error: Elasticsearch endpoint URL is not configured.';

      const esClient = new ElasticClient({
        node: trimTrailingSlash(endpoint),
        auth: esApiKey ? { apiKey: esApiKey } : undefined,
      });

      let body: Record<string, unknown> = { query: { multi_match: { query: args.query, fields: ['*'] } } };
      if (toolDef?.embeddingModel?.model && args.query) {
        try {
          const vector = await runEmbeddingByProvider(
            {
              provider: toolDef.embeddingModel.provider || 'Google',
              model: toolDef.embeddingModel.model,
              apiKey: String(toolDef.embeddingModel.apiKey || apiKey || ''),
              baseUrl: String(toolDef.embeddingModel.baseUrl || ''),
            },
            args.query,
          );
          if (Array.isArray(vector) && vector.length > 0) {
            body = {
              knn: {
                field: vectorField,
                query_vector: vector,
                k: 5,
                num_candidates: 50,
              },
              _source: true,
            };
          }
        } catch (e) {
          log(`[Tool: ${node.data.label}] Embedding failed, fallback to text search: ${String(e)}`);
        }
      }

      try {
        const searchParams: Record<string, unknown> = { ...body };
        if (index) searchParams.index = index;

        const resp = await esClient.search(searchParams as any);
        const data = (resp as { hits?: { hits?: Array<{ _source?: unknown; _score?: number }> } }).hits;
        const hits = data?.hits || [];
        if (hits.length === 0) return 'No results found.';

        const compactHits = hits.slice(0, 5).map((h) => ({
          score: h._score,
          source: compactElasticSource(h._source, vectorField),
        }));

        return JSON.stringify(compactHits);
      } catch (e) {
        return `Error fetching from Elasticsearch: ${String(e)}`;
      }
    }

    case 'HTTPRequestComponent': {
      const method = String(getNodeFieldValue(node, 'method') || 'GET');
      let url = String(getNodeFieldValue(node, 'url') || args.query || '');
      if (typeof url === 'string' && url.includes('{query}')) url = url.replace('{query}', args.query || '');
      try {
        const res = await fetch(url, { method });
        return await res.text();
      } catch (e) {
        return `Error fetching ${url}: ${String(e)}`;
      }
    }

    case 'GitLabMergeRequestComponent': {
      const baseUrl = trimTrailingSlash(getNodeFieldValue(node, 'baseUrl') || 'https://gitlab.com/api/v4');
      const projectIdRaw = String(getNodeFieldValue(node, 'projectId') || args.projectId || '').trim();
      const mergeRequestIid = String(getNodeFieldValue(node, 'mergeRequestIid') || args.mergeRequestIid || args.iid || '').trim();
      const action = String(getNodeFieldValue(node, 'action') || 'get_changes').trim();
      const privateToken = String(getNodeFieldValue(node, 'privateToken') || args.privateToken || '').trim();
      const noteBodyTemplate = String(getNodeFieldValue(node, 'noteBody') || 'Review from n2flow agent: {query}');
      const noteBody = interpolate(noteBodyTemplate, args);

      if (!projectIdRaw) return 'Error: GitLab projectId is required.';
      if (!mergeRequestIid) return 'Error: GitLab mergeRequestIid is required.';

      const projectId = encodeURIComponent(projectIdRaw);
      const mrPath = `${baseUrl}/projects/${projectId}/merge_requests/${encodeURIComponent(mergeRequestIid)}`;
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (privateToken) headers['PRIVATE-TOKEN'] = privateToken;

      try {
        const request = async (url: string, method: string = 'GET', body?: unknown) => {
          const response = await fetch(url, {
            method,
            headers: {
              ...headers,
              ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          if (!response.ok) {
            const text = await response.text().catch(() => '');
            return `Error GitLab ${response.status}: ${text || response.statusText}`;
          }

          const data = await response.json().catch(() => null);
          return serializeToolResult(data);
        };

        if (action === 'get_notes') {
          return await request(`${mrPath}/notes?per_page=100`);
        }

        if (action === 'get_discussions') {
          return await request(`${mrPath}/discussions?per_page=100`);
        }

        if (action === 'post_note') {
          if (!noteBody.trim()) return 'Error: Note body is empty.';
          return await request(`${mrPath}/notes`, 'POST', { body: noteBody });
        }

        return await request(`${mrPath}/changes`);
      } catch (e) {
        return `Error calling GitLab API: ${String(e)}`;
      }
    }

    case 'JSONParserComponent': {
      const raw = String(args.query || args.json || args.input || '');
      if (!raw.trim()) {
        return 'Error: JSON input is empty. Provide JSON text in tool args.query.';
      }

      const parsed = parseJsonSafely(raw);
      if (parsed === undefined) {
        return 'Error: Invalid JSON input.';
      }

      return JSON.stringify(parsed);
    }

    case 'CodeExecutionComponent': {
      const code = String(getNodeFieldValue(node, 'code') || '');
      const input = String(args.query || args.input || '');
      return executeJsTool(code, input, args);
    }

    case 'ConditionComponent': {
      const condition = String(getNodeFieldValue(node, 'condition') || '').trim();
      if (!condition) {
        return 'Error: Condition is empty. Set "condition" in Router node.';
      }

      const query = String(args.query || args.input || '');
      const sandbox: Record<string, unknown> = {
        input: query,
        query,
        args,
        JSON,
        Math,
        Date,
      };

      try {
        const context = createContext(sandbox);
        const script = new Script(`Boolean(${condition})`);
        const value = script.runInContext(context, { timeout: 500 });
        return String(Boolean(value));
      } catch (err) {
        return `Error evaluating condition: ${String(err)}`;
      }
    }

    case 'DataStreamComponent': {
      const streamType = String(getNodeFieldValue(node, 'streamType') || 'Metrics Array');
      if (streamType === 'Single Value') {
        const value = Number.parseFloat(String(args.query || ''));
        return Number.isFinite(value)
          ? String(value)
          : String(Math.round((50 + Math.random() * 50) * 100) / 100);
      }

      const samples = Array.from({ length: 10 }, (_, idx) => ({
        name: `P${idx + 1}`,
        value: Math.round((20 + Math.random() * 80) * 100) / 100,
      }));
      return JSON.stringify(samples);
    }

    default:
      return `Error: Unsupported tool node type "${node?.data?.type || 'unknown'}".`;
  }
};
