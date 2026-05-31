# N2FLOW

N2FLOW is an open-source flow editor and execution platform for building, testing,
and running AI workflows composed of LLM, tool, and agent nodes.

This repository contains a full-stack implementation:

- `front-end/` — Vite + React single-page app providing the visual flow editor and
	UI for authentication, flow management, and secrets.
- `back-end/` — Express-based API and flow runtime with Prisma persistence,
	node/tool/LLM integrations, and runtime validation.
- `packages/types/` — Shared TypeScript types for flows, nodes and runtime messages.

---

## Quick Start

Prerequisites:

- Node.js 20+
- npm
- A database supported by Prisma (see [back-end/prisma/schema.prisma](back-end/prisma/schema.prisma)).

Install dependencies for the whole repo:

```bash
npm run install:all
```

Run both applications in development (concurrently):

```bash
npm run dev
```

Run backend or frontend individually:

```bash
npm run dev:backend
npm run dev:frontend
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8787 (configurable via `SQL_SERVER_PORT`)

Build and type-check:

```bash
npm run build
npm run type-check
```

Database helper scripts (proxy to back-end):

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:reset
npm run db:studio
```

Utility scripts:

```bash
npm run format     # Format code with Prettier
npm run lint       # Lint code with ESLint
npm run gen-key    # Generate a 32-byte hex key for ENCRYPTION_KEY
```

---

## Documentation

- **API Documentation**: When the backend is running, visit `http://localhost:8787/api-docs` for the Swagger UI.
- **Architecture**: See [GEMINI.md](GEMINI.md) for project standards and architectural notes.

---

## Architecture Overview

- Backend: Express app exposing REST endpoints and a streaming NDJSON execution
	interface. Uses Prisma for persistence and contains a flow execution engine
	that performs topological sorting, dead-path elimination (DPE), concurrency
	control, per-node timeouts and streaming events.
- Frontend: React + Vite single-page app with protected routes and a visual
	flow editor (uses `@xyflow/react`, `dagre`, and `tailwindcss`).
- Tools/Nodes: Tool integrations and node implementations are registered
	centrally (see `tools/` and `nodes/`).

---

## Environment Variables

The backend reads several environment variables to configure runtime behavior.
Important ones include:

- `NODE_ENV` — `production` or `development` (enables stricter defaults in prod)
- `SQL_SERVER_PORT` — port the backend listens on (default: `8787`)
- `ENABLE_AUTH` — when `true`, authentication is enforced (also enabled in production)
- `JWT_SECRET` — secret used to sign JWT tokens (required for auth)
- `VALID_API_KEYS` — comma-separated whitelist of valid API keys
- `ENCRYPTION_KEY` — AES key used to encrypt stored secrets
- `ENABLE_LOG_SANITIZATION` — when `true` will mask secrets in console logs
- Rate limiting flags and values:
	- `ENABLE_RATE_LIMIT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
	- `ENABLE_AUTH_RATE_LIMIT`, `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`
- Flow runtime tuning:
	- `EXECUTOR_CONCURRENCY` — max parallel node executions (default 4)
	- `MAX_FLOW_NODES` — hard limit on executed nodes in a single flow
	- `GLOBAL_FLOW_TIMEOUT` — global flow execution timeout (ms)
	- `NODE_EXECUTION_TIMEOUT_MS` — per-node execution timeout (ms)

Store secrets (JWT, ENCRYPTION_KEY) securely and avoid committing `.env` files.

---

## API Reference (Highlights)

All backend API routes are mounted under `/api`.

- Authentication
	- `POST /api/auth/register` — create a new user (email, username, password)
	- `POST /api/auth/login` — log in, returns a JWT token
	- `GET /api/auth/profile` — get current authenticated user
	- `POST /api/auth/logout` — client-side logout endpoint (returns success)

- Flow execution and storage (protected)
	- `POST /api/flow/execute` — execute a flow synchronously. Request body must
		include `nodes` and `edges` (see `back-end/middleware/validation.ts` for request schema).
	- `POST /api/flow/execute/stream` — execute a flow and receive NDJSON runtime events
		(heartbeat `ping` events are emitted every 10s; the stream closes on client disconnect).
	- `GET /api/flows` — list saved flows for the authenticated user (supports pagination)
	- `GET /api/flows/:id` — get a saved flow
	- `POST /api/flows` — save or update a flow (creates versions)
	- `DELETE /api/flows/:id` — delete a flow
	- `GET /api/flows/:id/versions` — list flow versions
	- `GET /api/flows/:id/versions/:versionId` — get a specific version
	- `POST /api/flows/:id/versions/:versionId/restore` — restore a previous version

- Tools, LLM and utilities
	- `GET /api/tools` — list registered tools
	- `GET /api/tools/:toolId` — tool metadata and required params
	- `POST /api/llm/models` — list models from an LLM provider (provide `provider` / `baseUrl` / `apiKey`)
	- `POST /api/sql/query` — run a SQL query (MSSQL client used) with row limits and timeouts

- Secrets management (protected)
	- `POST /api/secrets` — create a new secret (stored encrypted)
	- `GET /api/secrets` — list secrets (returns masked previews)
	- `GET /api/secrets/:id` — retrieve secret value (decrypted)
	- `PUT /api/secrets/:id` — update secret
	- `DELETE /api/secrets/:id` — delete secret
	- `POST /api/secrets/:id/regenerate` — generate a new secret value

For a complete list, browse the route implementations in `back-end/routes/`.

---

## Flow Runtime (engine notes)

- Execution model: the engine builds DAG maps (in-degree/outgoing) and performs
	a topological order dispatch. Kahn's algorithm is used for cycle detection.
- Dead-Path Elimination (DPE): nodes with no active inputs (after condition
	routing) are skipped instead of executed.
- Concurrency: the runtime maintains an active semaphore limited by
	`EXECUTOR_CONCURRENCY` so fast nodes do not wait for slow parallel siblings.
- Timeouts and circuit breakers: per-node timeouts, a global flow timeout and a
	node-count limit protect against runaway executions.
- Dynamic resolution: node config and params support placeholders and dynamic
	references like `{{nodes.NODE_ID}}` and `{{nodes.NODE_ID.field}}`; placeholders
	are first resolved using provided global variables then server environment.
- Streaming: `/api/flow/execute/stream` emits incremental events (node updates,
	logs, results and heartbeat `ping` events). The client should gracefully
	handle `ping` and end the connection on socket close.

---

## Frontend

- Tech: React + Vite + TypeScript. Uses `@xyflow/react` for editor primitives,
	`dagre`/`elkjs` for layout assistance, and `tailwindcss` for styling.
- Entry point: `front-end/App.tsx` (routes include `/login`, `/`, `/flow/:id`, `/secrets`).
- The UI uses a protected-route pattern and a small API helper library at `front-end/lib/api`.

---

## Development & Testing

- Run backend tests (examples):

```bash
npm --prefix back-end run test
```

- A workspace task `Run backend auth tests` is available for convenience.

---

## Contributing

Please open issues or pull requests. When contributing:

- Add tests for backend behavior when appropriate.
- Keep environment secrets out of commits; prefer CI for secret provisioning.
- Follow the existing TypeScript style and run `npm run type-check` before PRs.

---

## Where to look next

- Backend routes: [back-end/routes](back-end/routes)
- Flow engine: [back-end/services/flowExecutionService.ts](back-end/services/flowExecutionService.ts)
- Frontend entry: [front-end/App.tsx](front-end/App.tsx)

If you want, I can split this README into dedicated docs (`docs/backend.md`,
`docs/frontend.md`, `docs/api.md`) and add a short API reference with example
requests. Would you like me to proceed with that?
