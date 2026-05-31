# Execution Engine

The backend execution engine is responsible for running the flows in the correct order.

## Core Concepts

- **Topological Sorting**: Ensures nodes are executed in the correct dependency order.
- **Dead-Path Elimination (DPE)**: Skips execution of nodes that don't have active inputs.
- **Concurrency Control**: Executes parallel branches simultaneously up to a defined limit.
- **Streaming NDJSON**: Provides real-time updates to the frontend during execution.

## Configuration

The engine behavior can be tuned using environment variables like `EXECUTOR_CONCURRENCY` and `MAX_FLOW_NODES`.
