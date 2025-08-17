# Agent Tools Plugin

Provides a node that selects and exposes a set of enabled tools for an Agent node downstream.

## Files
- `.nflow.json` - plugin manifest used for discovery.
- `index.ts` - barrel exports.
- `src/agentTools.ts` - execution, types, available tool list placeholder.
- `src/node.tsx` - Node UI component.
- `src/form.tsx` - Form UI (light wrapper currently).

## TODO
- Integrate with actual tool registry once available.
- Add validation for unknown tool identifiers.
- Provide server-side helper to resolve tool metadata.
