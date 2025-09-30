# prisma-read Plugin

This package provides a node for reading data from any Prisma model (database table) with optional filter and limit.

## Structure
- `form/index.tsx`: React form for configuring the node (model, filter, limit).
- `node/index.tsx`: React node UI for the flow editor.
- `execute.ts`: Node execution logic, queries Prisma using the provided config.
- `plugin.ts`/`index.ts`: Plugin registration and export.
- `.nflow.json`: Plugin metadata.

## Usage
- Add a `prisma-read` node to your flow.
- Configure the model (e.g., `User`, `Conversation`), filter (JSON), and limit.
- On execution, the node will fetch data from the specified Prisma model.

## Security
- Only models available in the Prisma client can be queried.
- Filter must be valid JSON.

## TODO
- Add model auto-complete in the form.
- Add advanced filter builder UI.
