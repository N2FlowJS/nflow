---
layout: default
title: Agent Usage Guide
nav_order: 15
---

# NFlow Agent Usage Guide

## Overview

Agents in NFlow are configurable AI assistants that automate document processing, answer questions, and perform workflow tasks using your knowledge base. This guide explains how to create, configure, and interact with agents.

## What is an Agent?

An Agent is a virtual assistant that can:

- Answer user queries using semantic search and LLMs
- Automate document processing workflows
- Integrate with external APIs or systems
- Be customized for specific teams or users

## Creating an Agent

1. Go to the **Agents** section in the NFlow dashboard.
2. Click **Create Agent**.
3. Fill in the agent details:
   - **Name**: Agent's display name
   - **Description**: Purpose or scope of the agent
   - **Owner**: Assign to a user or team
   - **Active**: Enable or disable the agent

4. Click **Save** to create the agent.

## Configuring Agent Flows

Each agent can be configured with a flow (pipeline) that defines its behavior:

1. Select your agent and click **Flow Editor**.
2. Use the visual editor to add, connect, and configure nodes:
   - **Input**: Accepts user queries or triggers
   - **Retriever**: Performs vector search in the knowledge base
   - **LLM**: Generates answers using a language model
   - **Categorize/Filter**: Branches logic based on content
   - **Output**: Returns results to the user

3. Drag and drop nodes, connect them, and set parameters as needed.
4. Click **Save Flow** to apply changes.

## Chatting with an Agent

1. Open the agent detail page.
2. Use the chat interface to ask questions or give commands.
3. The agent will process your input using its configured flow and return results.

**Features:**
- Supports streaming responses (toggleable)
- Maintains conversation context
- Can reference documents in your knowledge base

## Managing Agents

- **Edit Agent**: Update name, description, or owner.
- **Activate/Deactivate**: Enable or disable agent availability.
- **Delete Agent**: Remove agent (irreversible).

## Permissions

- Agents can be owned by users or teams.
- Only owners and admins can edit or delete agents.
- Team agents are accessible to all team members.

## Advanced Usage

- **Custom Nodes**: Extend agent flows with plugins or custom logic.
- **API Integration**: Use agents via API endpoints for automation.
- **Workflow Automation**: Trigger agents from webhooks or scheduled tasks.

## Example: Ask a Question

1. Go to an agent's chat page.
2. Type: `What are the latest updates in our project?`
3. The agent retrieves relevant documents and generates an answer.

## Troubleshooting

- If an agent does not respond, check if it is active and the flow is configured.
- Review logs for errors in processing or LLM integration.
- Ensure the agent has access to the relevant knowledge base.

## Further Reading

- [Technical Architecture](technical-architecture.md)
- [Integration Guide](integration-guide.md)
- [Plugin Development](plugin-development.md)
