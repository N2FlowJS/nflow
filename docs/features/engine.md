# Execution Engine Deep Dive

The N2FLOW Execution Engine is a sophisticated runtime designed to execute directed acyclic graphs (DAGs) of AI operations with high concurrency and reliability.

## Execution Lifecycle

When a flow execution is triggered (via `/api/flow/execute/stream`), the engine follows these steps:

1.  **Graph Construction**: The list of nodes and edges is converted into an internal adjacency map and in-degree map.
2.  **Topological Sort**: The engine performs a Kahn's algorithm topological sort to ensure nodes are executed only after their dependencies are met. It also detects cycles at this stage.
3.  **Dynamic Scheduling**:
    -   Nodes with 0 in-degree are placed in a `readyQueue`.
    -   An event-driven loop dispatches nodes from the queue to available execution slots (controlled by `MAX_CONCURRENCY`).
    -   As a node completes, it decrements the in-degree of its children and moves them to the `readyQueue` if they become 0.
4.  **Dead-Path Elimination (DPE)**: Before executing a node, the engine checks if it has any "live" paths. If a node is a child of a `ConditionComponent` branch that wasn't taken, and all other incoming paths are also skipped or dead, this node is marked as `skipped`, and the skip status propagates downstream.
5.  **Streaming**: Throughout the process, the engine streams NDJSON events back to the client, including `log`, `nodeUpdate` (status changes), `llm_chunk` (token-by-token output), and `result`.

## Advanced Logic

### Input Resolution
Nodes don't just receive static values; their inputs are resolved dynamically:
-   **Handle Matching**: Data is passed through specific handles (ports). A node can distinguish between `system_prompt` and `user_input`.
-   **Node References**: <span v-pre>`{{nodes.NODE_ID.field}}`</span> syntax to pull data from previously executed nodes.
-   **Global Variables**: <span v-pre>`{{VAR_NAME}}`</span> syntax is resolved against the flow's global variables and encrypted secrets.


### Condition Component
The `ConditionComponent` is a special node that controls flow branching. It evaluates a condition and outputs its result to either a `true` or `false` handle. The engine's DPE logic ensures that only the branch matching the result is executed.

### Circuit Breakers
-   **Node Limit**: To prevent accidental infinite recursion (if the graph logic somehow bypasses cycle detection), execution is aborted after 500 node runs.
-   **Time Limit**: Global execution is capped at 5 minutes to free up server resources.
-   **Per-node Timeout**: Individual nodes (like long LLM calls) are capped at 3 minutes.

## Configuration

The engine behavior is managed through the following environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXECUTOR_CONCURRENCY` | Maximum number of nodes running in parallel. | `5` |
| `MAX_FLOW_NODES` | Maximum total nodes allowed per flow execution (protection against loops). | `500` |
| `GLOBAL_FLOW_TIMEOUT` | Global timeout for the entire flow execution in milliseconds. | `300000` (5 mins) |
| `NODE_EXECUTION_TIMEOUT_MS` | Timeout for a single node execution in milliseconds. | `180000` (3 mins) |
| `ENCRYPTION_KEY` | 32-character key for encrypting/decrypting secrets at rest. | (Required) |
| `JWT_SECRET` | Secret key for signing authentication tokens. | (Required) |
