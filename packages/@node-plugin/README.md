# @node-plugin

Core package for node plugin system in NFlow. Handles plugin discovery, configuration loading, and component scanning.

## 📁 Structure

```
@node-plugin/
├── index.ts                 # Main entry point (smart exports)
├── browser.ts               # Browser-only entry point
├── type.ts                  # TypeScript type definitions
│
├── core/                    # Core functionality
│   ├── config-loader.ts     # Plugin configuration loading
│   ├── package-scanner.ts   # Package discovery
│   └── utils.ts             # File system utilities
│
└── discovery/               # Component discovery
    ├── index.ts             # Smart exports based on environment
    ├── server-discover.ts   # Server-side component scanning
    └── ui-discover.ts       # Browser-side component access
```

## 🎯 Responsibilities

### Core (`core/`)

**config-loader.ts** - Plugin Configuration Management
- Load `.nflow.json` configuration files
- Read `package.json` nflow fields
- Cache configurations for performance
- Merge configs with precedence rules

**package-scanner.ts** - Package Discovery
- Scan packages directory
- List available plugin packages
- Filter internal packages
- Check package existence

**utils.ts** - File System Utilities
- Environment detection (Node vs Browser)
- Lazy require for fs/path
- Directory resolution and navigation
- File existence checks

### Discovery (`discovery/`)

**server-discover.ts** - Server-Side Scanning
- Scan and load React components from packages
- Discover node components (`/node` directory)
- Discover form components (`/form` directory)
- Normalize package names for keys
- Cache form components

**ui-discover.ts** - Browser-Side Access
- Access pre-injected components from `window` object
- Provide type-safe access to discovered components
- Check component availability
- Get component lists and maps

## 📦 Usage

### Server-Side (Node.js)

```typescript
import { 
  getNodePluginConfig,
  scanNodeComponents,
  scanNodeForms,
  getDynamicNodeTypeKeys,
} from '@node-plugin';

// Load plugin configs
const configs = getNodePluginConfig();

// Scan for components
const nodes = scanNodeComponents();
const forms = scanNodeForms();

// Get available packages
const packages = getDynamicNodeTypeKeys();
```

### Browser-Side

```typescript
import { 
  getDiscoveredNodeComponents,
  getDiscoveredNodeForms,
  getClientNodeTypes,
  hasNodeType,
} from '@node-plugin/browser';

// Access pre-injected components
const nodes = getDiscoveredNodeComponents();
const forms = getDiscoveredNodeForms();

// Check if a type exists
if (hasNodeType('http-request')) {
  // ...
}
```

### Universal (Works in both)

```typescript
import { 
  getAllNodeTypeKeys,
  NODE_TYPES,
} from '@node-plugin';

// Get all available node type keys
const keys = getAllNodeTypeKeys();

// Use constants
const type = NODE_TYPES['http-request'];
```

## 🔧 Configuration

Plugin configuration can be defined in two ways:

### 1. Dedicated Config File (`.nflow.json`)

```json
{
  "enabled": true,
  "order": 10
}
```

### 2. Package.json Field

```json
{
  "name": "my-plugin",
  "nflow": {
    "enabled": true,
    "order": 10
  }
}
```

## 🌳 Tree-Shaking

The package is organized for optimal tree-shaking:

- **Server-only code**: In `core/` and `discovery/server-discover.ts`
- **Browser-safe code**: In `discovery/ui-discover.ts`
- **Universal code**: In `type.ts`

Use `@node-plugin/browser` entry point for browser builds to exclude server-only code.

## ⚡ Performance

- **Caching**: Config and form scans are cached
- **Lazy Loading**: Components loaded on-demand
- **Smart Resolution**: Fast package directory lookup
- **Deduplication**: Prevents duplicate scans

## 🧪 Testing

```bash
npm test -- packages/@node-plugin
```

## 📝 Migration from Old Structure

Old imports:
```typescript
import { scanNodeComponents, scanNodeForms } from '@node-plugin/scanPlugins';
```

New imports:
```typescript
import { scanNodeComponents, scanNodeForms } from '@node-plugin';
// or
import { scanNodeComponents, scanNodeForms } from '@node-plugin/discovery/server-discover';
```

All exports are now available from the main index, organized by functionality.
