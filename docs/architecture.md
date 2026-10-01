# Architecture Overview

## System Components

- **Backend**: Express app exposing REST endpoints and a streaming NDJSON execution
  interface. Uses an5orm for persistence and contains a flow execution engine
  that performs topological sorting, dead-path elimination (DPE), concurrency
  control, per-node timeouts and streaming events. Includes a centralized
  **LLM Provider Service** for managing external model APIs.
- **Frontend**: React + Vite single-page app with protected routes and a visual
  flow editor (uses `@xyflow/react`, `dagre`, and `tailwindcss`). Features a
  **Cyberpunk Glassmorphism** theme and a **Health & Connection Guard** for
  reliable startup.
- **Shared Types**: Centralized TypeScript types for flows, nodes and runtime messages.

## Tech Stack

- **Backend**: Node.js, Express, an5orm + @an5/adapters (PostgreSQL), Zod, Vitest.
- **Frontend**: React, Vite, Tailwind CSS 4, XYFlow.
- **Shared**: TypeScript, NPM Workspaces.

## Key Architectual Patterns

### Execution Engine

The engine uses Kahn's algorithm for topological sorting and implements a semaphore-based concurrency control. It supports Dead-Path Elimination (DPE) to optimize branching logic.

### Health Monitoring

The frontend implements a pre-flight health check to ensure the backend and database are ready before bootstrapping the authentication session.

## Project Structure

- `back-end/`: Express server, an5orm DB layer, Flow Runtime.
- `front-end/`: React (Vite), XYFlow editor.
- `packages/types/`: Shared TypeScript types.

## Coding Conventions

- **General**: Use TypeScript for everything. Prefer functional components and hooks in the frontend. Use Zod for all input validation in the backend.
- **Backend**: Routes in `back-end/routes/`, logic in `back-end/services/`. Use custom logger.
- **Frontend**: Components in `front-end/components/`, pages in `front-end/pages/`, hooks in `front-end/hooks/`.
