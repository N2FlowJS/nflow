---
layout: default
title: LLM & Model Guide
nav_order: 18
---

# LLM & Model Guide

> **NFlow leverages Large Language Models (LLMs) for advanced AI features such as chat, summarization, and workflow automation.**

---

## 📖 What is an LLM?

A **Large Language Model (LLM)** is an AI model trained on massive text datasets to understand and generate human-like language.

**In NFlow, LLMs are used for:**
- Answering user queries
- Summarizing documents
- Generating workflow outputs
- Enabling conversational agents

---

## 🤖 Supported LLM Providers

- **OpenAI** (default: GPT-3.5, GPT-4)
- **Azure OpenAI**
- **Anthropic Claude**
- **Google Gemini**
- **Self-hosted models** (Llama, Vicuna, Mistral, Ollama, vLLM, LM Studio, ...)

---

## ⚙️ Model Configuration

Set your LLM provider and model via environment variables:

```env

```


---

## 📊 Model Selection Table

| Provider      | Model Name         | Context Length | Use Case                        |
|---------------|-------------------|:-------------:|----------------------------------|
| OpenAI        | gpt-3.5-turbo     | 16k           | General chat, Q&A, workflows     |
| OpenAI        | gpt-4             | 128k          | Advanced reasoning, long docs    |

---

## 🚀 LLM Usage in NFlow

- **Chat Agents:** Generate answers using retrieved knowledge.
- **Summarization:** Condense long documents or search results.
- **Workflow Automation:** Use LLMs in custom workflow nodes for text generation or transformation.

---

## 🛠️ Advanced Features

- **Streaming Responses:** Real-time token streaming for chat.
- **Function Calling:** LLMs can call functions/APIs based on user intent.
- **System Prompts:** Customize system instructions per agent/workflow.

---

## 💡 Best Practices

- Choose the smallest model that meets your quality needs for cost and speed.
- Use context window efficiently: include only relevant knowledge in prompts.
- Monitor token usage and API costs.
- For privacy, use self-hosted or on-premise models.

---

## 🧩 Troubleshooting

- **Slow responses:** Check provider status and network latency.
- **Model errors:** Verify API keys and endpoint URLs.
- **Context truncation:** Reduce prompt size or use a model with a larger context window.

---

## 📚 Further Reading

- [Embedding Models Guide](embedding-models.md)
- [Agent Usage Guide](agent-guide.md)
- [Integration Guide](integration-guide.md)
