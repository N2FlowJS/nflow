# history-message Plugin

This package provides a node for retrieving chat history from the database (Prisma) using Conversation and ConversationMessage models.

## Structure
- `form/index.tsx`: React form for configuring the node (userId, conversationId, historyType, limit).
- `node/index.ts`: Node logic for fetching chat history from Prisma.
- `execute.ts`: Node execution logic, queries Prisma using the provided config.
- `plugin.ts`/`index.ts`: Plugin registration and export.
- `.nflow.json`: Plugin metadata.

## Features
- Query chat history by user, conversation, or all.
- Limit the number of messages returned.
- Returns messages in MessagePart format for downstream nodes.

## Usage
- Add a `history-message` node to your flow.
- Configure userId, conversationId, historyType, and limit in the form.
- On execution, the node will fetch messages from the database.

## TODO
- Add auto-complete for user/conversation selection.
- Add tests and error handling improvements.
