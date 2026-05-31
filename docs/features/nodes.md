# Node Reference

A comprehensive guide to the nodes available in the N2FLOW editor.

## Standard Nodes

### Chat Input
- **Purpose**: The starting point for interactive flows. Receives the user's message from the Playground.
- **Config**: 
    - `System Prompt`: (Optional) Static text to prepend to the user's message.
- **Outputs**: `input_value` (the text entered by the user).

### Chat Output
- **Purpose**: The final destination for flow results. Sends text back to the Playground.
- **Config**:
    - `Output Value`: (Optional) Static text or a template to send. Usually connected to a data source.
- **Inputs**: Receives values from any preceding node. The engine uses the result of the first `ChatOutput` node it completes as the primary flow response.

### Current Time
- **Purpose**: Injects the current server time into the flow.
- **Config**:
    - `Format`: (Optional) Date formatting string (e.g., `YYYY-MM-DD`).
- **Outputs**: Current date/time as a string.

### Wait
- **Purpose**: Pauses flow execution.
- **Config**: 
    - `Delay (ms)`: Number of milliseconds to wait (default: 1000).

## Logic Nodes

### Condition Component
- **Purpose**: Directs the flow based on a boolean condition.
- **Config**: `Condition` (JavaScript expression).
- **Outputs**: `true` handle and `false` handle.
- **Behavior**: The engine evaluates the condition and only executes the branch connected to the matching handle.

### Code Execution
- **Purpose**: Runs custom JavaScript snippets in a protected sandbox.
- **Config**: 
    - `JavaScript Code`: The code to run. Access inputs via the `inputs` object.
- **Outputs**: The return value of the script.

## AI & LLM Nodes

### Agent
- **Purpose**: The core reasoning engine. Can use tools, follow system instructions, and maintain chat history.
- **Config**:
    - `Agent Template`: Predefined behavior patterns (Assistant, Researcher, Coder, etc.).
    - `System Instruction`: The main prompt defining the agent's persona and rules.
- **Inputs**:
    - `agent_llm`: A connection from an LLM Config node.
    - `input_value`: The user's query or data to process.
    - `system_prompt`: Instructions for the agent's behavior.
    - `tools`: (Optional) Connections from Tool nodes.
- **Outputs**: `response` (the agent's text reply).

### vLLM Chat (LLM Config)
- **Purpose**: Configures an LLM for use by an Agent.
- **Config**: 
    - `Provider`: OpenAI, Google, Anthropic, NVIDIA, Ollama, etc.
    - `Model Name`: Specific model identifier (e.g., `gpt-4o`, `gemini-1.5-pro`).
    - `Temperature`: Controls randomness (0.0 to 2.0).
    - `Max Tokens`: Maximum length of the generated response.
    - `Stream`: Whether to enable token-by-token streaming.

### vLLM Embedding
- **Purpose**: Configures an embedding model for vector search.

### Prompt Template
- **Purpose**: A multi-line text editor for building prompts.
- **Config**: `Template` (supports interpolation).
- **Interpolation**:
    - Use <span v-pre>`{handle_name}`</span> to inject values from connected input handles.
    - Use <span v-pre>`{{variable_name}}`</span> to inject global variables or environment secrets.
    - Use <span v-pre>`{{nodes.ID.field}}`</span> to reference specific node outputs directly.

### Variable Component
- **Purpose**: Injects a global variable's value or a constant into the flow.
- **Config**: 
    - `Variable Name`: (Optional) Must match a name in the Global Variables panel.
    - `Constant Value`: A static text value.
- **Outputs**: The resolved value.

## Tool Nodes

Tool nodes can be connected to the `tools` handle of an **Agent**.

- **HTTP Request**:
    - `Method`: GET, POST, PUT, DELETE.
    - `URL`: The endpoint to call.
    - `Headers`: Custom JSON headers.
- **Serper Search**: Web search via Serper.dev.
- **GitLab / GitHub**: 
    - `Action`: Get changes, Get comments, Post comment, etc.
    - `Project ID` / `Repo`: Target repository identifiers.
- **MSSQL**: 
    - `Server`: Hostname or IP.
    - `Database`: DB name.
    - `Query Template`: SQL query to run.
    - `Max Rows`: Cap on returned results.
- **Elasticsearch**: Vector search for RAG.
- **FileSystem**: Read, Write, or Append to local files.
- **Image Generation**:
    - `Model`: `dall-e-3` or `dall-e-2`.
    - `Size`: `1024x1024`, `1024x1792`, or `1792x1024`.
