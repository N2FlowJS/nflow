# N2FLOW

## Run

1. Start frontend:

```bash
npm run dev
```

2. Start MSSQL backend API (new terminal):

```bash
npm run dev:server
```

SQL API runs at `http://localhost:8787`.

## Flow Runtime (server-only)

- Flow execution now runs on server runtime only.
- Realtime event stream endpoint: `POST /api/flow/execute/stream` (NDJSON events).
- Batch endpoint remains available: `POST /api/flow/execute`.
- Server runtime centralizes provider calls for easier maintenance and API key handling.
- Server runtime source is now TypeScript under `server/` and runs via `tsx`.
- Installed provider SDKs:
	- `@google/genai`
	- `openai`
	- `ollama`

### Runtime checklist (stability + UX/perf)

- [x] NDJSON streaming endpoint for real-time execution events.
- [x] Client-disconnect-aware cancellation in server executor.
- [x] Stream heartbeat (`ping`) events to keep long-running connections alive.
- [x] Frontend request cancellation for overlapping manual runs.
- [x] Live-mode overlap guard (skip tick when previous silent run is still active).
- [x] Configurable runtime base URL via `VITE_RUNTIME_URL` (fallback `http://localhost:8787`).

## MSSQLPyODBCComponent (real execution)

- Set node params in Flow Editor:
	- `Server Host`, `Port`, `DB User`, `DB Password`, `Database`
	- `Query Template` (supports placeholders like `{query}` when used as tool)
	- `Max Rows` to limit response size (default `200`)
- When connected to Agent `tools`, the node executes real SQL through backend API.