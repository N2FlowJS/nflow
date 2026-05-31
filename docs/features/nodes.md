# Node Reference

A comprehensive guide to the nodes available in the N2FLOW editor.

## Standard Nodes

### Chat Input
- **Purpose**: The starting point for interactive flows. Receives the user's message from the Playground.
- **Outputs**: `input_value` (the text entered by the user).

### Chat Output
- **Purpose**: The final destination for flow results. Sends text back to the Playground.
- **Inputs**: Receives values from any preceding node. The engine uses the result of the first `ChatOutput` node it completes as the primary flow response.

### Current Time
- **Purpose**: Injects the current server time into the flow. Useful for prompt templating (e.g., "Today is <span v-pre>`{{date}}`</span>").

### Wait
- **Purpose**: Pauses flow execution for a specified number of milliseconds.

## Logic Nodes

### Condition Component
- **Purpose**: Directs the flow based on a boolean condition.
- **Config**: `Condition` (JavaScript expression).
- **Outputs**: `true` handle and `false` handle.
- **Behavior**: The engine evaluates the condition and only executes the branch connected to the matching handle.

## AI & LLM Nodes

### Agent
- **Purpose**: The core reasoning engine. Can use tools, follow system instructions, and maintain chat history.
- **Inputs**:
    - `agent_llm`: A connection from an LLM Config node.
    - `input_value`: The user's query or data to process.
    - `system_prompt`: Instructions for the agent's behavior.
    - `tools`: (Optional) Connections from Tool nodes.
- **Outputs**: `response` (the agent's text reply).

### vLLM Chat (LLM Config)
- **Purpose**: Configures an LLM for use by an Agent.
- **Config**: Provider (OpenAI, Gemini, etc.), Model Name, Temperature, API Key, Base URL.
- **Outputs**: `agent_llm` (the configuration object).

### vLLM Embedding
- **Purpose**: Configures an embedding model for vector search (e.g., in Elasticsearch).

### Prompt Template
- **Purpose**: A multi-line text editor for building prompts.
- **Config**: `Template` (supports <span v-pre>`{{variable}}`</span> and <span v-pre>`{{nodes.ID}}`</span> placeholders).


## Tool Nodes

Tool nodes can be connected to the `tools` handle of an **Agent**. When connected, the Agent will see these tools in its "available tools" list and can choose to invoke them.

- **HTTP Request**: Fetch data from any REST API.
- **Serper Search**: Search the live web.
- **GitLab / GitHub**: Fetch merge requests or post comments.
- **MSSQL**: Query relational databases.
- **Elasticsearch**: Perform vector search for RAG.
- **Code Execution**: Run safe JavaScript snippets.
- **FileSystem**: Read/Write files (requires local server access).
- **Image Generation**: Create images via DALL-E.
