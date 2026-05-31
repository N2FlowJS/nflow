# LLM Providers

Manage your AI model providers centrally and use them across multiple flows.

## Supported Providers

- **OpenAI**: GPT-4, GPT-3.5 Turbo.
- **Anthropic**: Claude 3 Opus/Sonnet/Haiku.
- **Google GenAI**: Gemini Pro, Gemini Flash.
- **NVIDIA NIM**: Self-hosted or hosted NVIDIA Inference Microservices.
- **Ollama**: Local LLM execution.
- **Groq**: High-speed inference.
- **Custom**: Any OpenAI-compatible API endpoint.

## Features

- **Centralized Configuration**: Set up your API keys and base URLs once.
- **Connection Testing**: Test connection to providers and scan for available models.
- **Dynamic Model Selection**: Once a provider is configured, you can select its models from a dropdown in the node config.
- **Secure Storage**: API keys are encrypted at rest using the Secret Service.

## Using a Provider

1. Go to the **LLM Providers** page from the sidebar.
2. Click **Add Provider** and select your type (e.g., OpenAI).
3. Enter your API Key and optional Base URL.
4. In the Flow Editor, select an **LLM Node** (like `vLLM Chat`).
5. In the config panel, choose your saved provider from the **Provider ID** dropdown.
6. Click **Scan** next to the Model field to see available models for that provider.
