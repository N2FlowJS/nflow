# Node Package Template

Purpose: Each node package provides three possible parts:

- Runtime executor (server): plugin.ts (exports `plugin` as NodePlugin) + execute.ts
- Node UI (client): node/index.tsx (renderer)
- Form UI (client): form/index.tsx (config form)

Config:

- .nflow.json or package.json.nflow
  - enabled: boolean (default: true)
  - order: number (sort key)

Exports (index.ts):

- export { plugin, plugin as <name>Plugin } from './plugin'

Naming:

- plugin.name must equal the package folder name (e.g., 'file-read')
- match(node) checks `node.data.type === '<name>'`

Server auto-registration:

- The runtime will load packages/<name> and look for an export shaped like NodePlugin
  (plugin/default/any named). Disabled packages are skipped.