---
layout: default
title: Plugin Development
nav_order: 11
---

# Plugin Development Guide

This guide explains how to extend NFlow with custom plugins.

## Overview

NFlow supports a plugin architecture for extending core functionality, including:

- Custom API endpoints
- UI components
- Document processors
- Search and workflow extensions

## Creating a Plugin

1. Create a new directory in `lib/plugins/your-plugin`
2. Implement the required interface (see examples below)
3. Register your plugin in `lib/plugins/index.ts`

## Example Plugin Structure

```
lib/plugins/your-plugin/
├── index.ts           # Main plugin entry point
├── handlers.ts        # Custom API handlers
├── components/        # UI components (if needed)
└── README.md          # Plugin documentation
```

## Registering a Plugin

Edit `lib/plugins/index.ts`:

```typescript
import yourPlugin from './your-plugin';
export default [
  // ...other plugins
  yourPlugin,
];
```

## Extension Points

- **API Extensions**: Add custom API endpoints
- **UI Extensions**: Add custom UI components
- **Processing Extensions**: Add custom document processors
- **Search Extensions**: Add custom search functionality
- **Workflow Extensions**: Add custom workflow actions

## Best Practices

- Keep plugins modular and well-documented
- Use TypeScript for type safety
- Follow NFlow's coding standards

## Further Reading

See the [Integration Guide](integration-guide.md) for more on extending NFlow.
