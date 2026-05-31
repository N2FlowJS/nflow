# API Documentation

The N2FLOW backend provides a RESTful API for managing flows, secrets, and execution.

## Swagger UI

When running the backend locally, you can access the full interactive API documentation at:

[http://localhost:8787/api-docs](http://localhost:8787/api-docs)

## Key Endpoints

### Authentication
- `POST /api/auth/register` — Create a new user
- `POST /api/auth/login` — Log in and receive a JWT
- `GET /api/auth/profile` — Get current user information

### Flow Management
- `GET /api/flows` — List all flows
- `POST /api/flows` — Create or update a flow
- `GET /api/flows/:id` — Get flow details

### Execution
- `POST /api/flow/execute` — Execute a flow synchronously
- `POST /api/flow/execute/stream` — Execute a flow with streaming updates

### Secrets
- `GET /api/secrets` — List stored secrets (masked)
- `POST /api/secrets` — Create a new encrypted secret
