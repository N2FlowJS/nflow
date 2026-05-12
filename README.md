# N2FLOW

N2FLOW is a flow editor for building and running AI workflows with LLM, tool, and agent nodes.

## Project Structure

- `front-end/`: Vite + React flow editor UI.
- `back-end/`: Express API, flow execution runtime, Prisma storage, tool adapters.
- `packages/types/`: shared flow/node typings.

## Prerequisites

- Node.js 20+
- npm
- A configured database for Prisma in `back-end/prisma/schema.prisma`

## Install

```bash
npm run install:all
```

## Run In Development

Start both applications:

```bash
npm run dev
```

Or start each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## Build And Type Check

```bash
npm run build
npm run type-check
```

## Database Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:reset
npm run db:studio
```

## Flow Runtime

Main endpoints:

- `POST /api/flow/execute`: run a flow and receive a batch result.
- `POST /api/flow/execute/stream`: run a flow and receive NDJSON events.
- `GET /api/flows`: list saved flows for the authenticated user.
- `POST /api/flows`: save a flow.

Streaming execution includes heartbeat `ping` events and stops when the client disconnects.

## Global Variables And Secret Placeholders

Node configuration fields can reference placeholders in the form `{{NAME}}`.

Resolution order:

1. Global variables sent with the flow request.
2. Server environment variables.

Execution validation now fails early when:

- a referenced global variable exists but has an empty value
- a placeholder cannot be resolved from either global variables or server env

This prevents provider-specific runtime failures caused by unresolved secrets.

## Notes

- The editor command palette can now add nodes at the exact canvas position chosen from the context menu.
- MSSQL password fields are treated as secret inputs in the UI and shared config schema.