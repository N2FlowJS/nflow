# Getting Started

N2FLOW is an open-source flow editor and execution platform for building, testing,
and running AI workflows composed of LLM, tool, and agent nodes.

## Prerequisites

- Node.js 20+
- npm
- A database supported by Prisma (see `back-end/prisma/schema.prisma`).

## Installation

Install dependencies for the whole repo:

```bash
npm run install:all
```

## Running the Application

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
- Backend API: http://localhost:8787

## Common Commands

### Build and Type-check

```bash
npm run build
npm run type-check
```

### Database Management

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:reset
npm run db:studio
```

### Utilities

```bash
npm run format     # Format code with Prettier
npm run lint       # Lint code with ESLint
npm run gen-key    # Generate an encryption key
```
