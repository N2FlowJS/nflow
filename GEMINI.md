# N2FLOW Project Standards

This file contains project-specific instructions and conventions for AI agents.

## Project Structure

- `back-end/`: Express server, Prisma DB, Flow Runtime.
- `front-end/`: React (Vite), XYFlow editor.
- `packages/types/`: Shared TypeScript types.

## Tech Stack

- **Backend**: Node.js, Express, Prisma (SQLite/PostgreSQL), Zod, Vitest.
- **Frontend**: React, Vite, Tailwind CSS 4, XYFlow.
- **Shared**: TypeScript, NPM Workspaces.

## Coding Conventions

### General
- Use TypeScript for everything.
- Prefer functional components and hooks in the frontend.
- Use Zod for all input validation in the backend.

### Backend
- Routes should be defined in `back-end/routes/`.
- Logic should be in `back-end/services/`.
- Use the custom logger in `back-end/utils/logger.ts` instead of `console.log`.
- All API responses should follow a consistent format (see `back-end/utils/apiResponse.ts` if it exists, or create one).

### Frontend
- Components should be in `front-end/components/`.
- Pages should be in `front-end/pages/`.
- Hooks should be in `front-end/hooks/`.
- Use Tailwind CSS for styling.

## Testing Strategy

- **Backend**: Use Vitest for unit and integration tests.
- **Frontend**: (Planned) Vitest + React Testing Library.

## Documentation

- Keep `README.md` up to date.
- Document complex logic in the code.
- (Planned) Swagger/OpenAPI for API documentation.
