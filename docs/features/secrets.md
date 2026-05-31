# Secrets Management

Securely managing API keys is critical for AI workflows.

## Features

- **Encryption at Rest**: All secrets are stored encrypted in the database using AES-256-GCM.
- **Masked Previews**: Only the last 4 characters are shown in the UI.
- **Dynamic Injection**: Use `{{SECRET_NAME}}` in node configurations to inject secrets at runtime.
- **User Scoping**: Secrets are private to the user who created them.

## Configuration

Make sure to set a secure `ENCRYPTION_KEY` in your environment.
