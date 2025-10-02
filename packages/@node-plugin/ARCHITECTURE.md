# @node-plugin Architecture

## 📐 Module Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                    @node-plugin                         │
│                                                         │
│  ┌────────────┐           ┌──────────────┐            │
│  │  type.ts   │◄──────────│  index.ts    │            │
│  │  (Types)   │           │ (Main Entry) │            │
│  └────────────┘           └──────┬───────┘            │
│                                  │                      │
│                    ┌─────────────┼─────────────┐       │
│                    │             │             │       │
│            ┌───────▼───────┐ ┌──▼──────┐ ┌────▼─────┐│
│            │  core/        │ │discovery/│ │browser.ts││
│            │               │ │          │ │ (Browser ││
│            │ ┌───────────┐ │ │┌────────┐│ │  Entry)  ││
│            │ │config-    │ │ ││server- ││ └──────────┘│
│            │ │loader.ts  │ │ ││discover││             │
│            │ └─────┬─────┘ │ │└────────┘│             │
│            │       │       │ │┌────────┐│             │
│            │ ┌─────▼─────┐ │ ││ui-     ││             │
│            │ │package-   │ │ ││discover││             │
│            │ │scanner.ts │ │ │└────────┘│             │
│            │ └─────┬─────┘ │ │          │             │
│            │       │       │ └──────────┘             │
│            │ ┌─────▼─────┐ │                          │
│            │ │utils.ts   │ │                          │
│            │ └───────────┘ │                          │
│            └───────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Server-Side Component Loading

```
┌──────────────┐
│   App Start  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ server-discover.ts          │
│ scanNodeComponents()        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Read packages/ directory    │
│ Find node/index.tsx files   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Load React components       │
│ Normalize package names     │
│ Cache in memory             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Return component map        │
│ { httpRequest: Component }  │
└─────────────────────────────┘
```

### Browser-Side Component Access

```
┌──────────────────┐
│  _document.tsx   │
│  Injects config  │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────┐
│ window.__NFLOW_NODE_COMPONENTS__│
│ = { httpRequest: Component }    │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│ ui-discover.ts             │
│ getDiscoveredNodeComponents│
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ dynamicNodeTypes.tsx       │
│ Uses components in Proxy   │
└────────────────────────────┘
```

## 🎭 Environment-Based Behavior

```
┌─────────────────────────────────────────────┐
│           getAllNodeTypeKeys()              │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌──────────────┐
│   Browser     │  │   Server     │
│               │  │              │
│ Uses:         │  │ Uses:        │
│ window        │  │ fs.readdir   │
│ .__NFLOW_*    │  │ packages/    │
│               │  │              │
│ Returns:      │  │ Returns:     │
│ ['key1',...]  │  │ ['key1',...] │
└───────────────┘  └──────────────┘
```

## 🔐 Encapsulation Layers

```
┌────────────────────────────────────────────┐
│         Public API (index.ts)              │
│  - getNodePluginConfig()                   │
│  - getDynamicNodeTypeKeys()                │
│  - scanNodeComponents()                    │
│  - getDiscoveredNodeComponents()           │
└───────────────┬────────────────────────────┘
                │
┌───────────────▼────────────────────────────┐
│      Core Implementation (core/)           │
│  - config-loader.ts                        │
│  - package-scanner.ts                      │
│  - utils.ts                                │
└───────────────┬────────────────────────────┘
                │
┌───────────────▼────────────────────────────┐
│    Discovery Layer (discovery/)            │
│  - server-discover.ts (Node.js)            │
│  - ui-discover.ts (Browser)                │
└────────────────────────────────────────────┘
```

## 💾 Caching Strategy

```
┌─────────────────────────────────────────┐
│         Cache Hierarchy                 │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌────────────┐      ┌──────────────┐
│Config Cache│      │ Form Cache   │
│            │      │              │
│ Key: path  │      │ Global Map   │
│ Value: map │      │ Invalidate   │
│ Timeout: ∞ │      │ on demand    │
└────────────┘      └──────────────┘
         │                  │
         ▼                  ▼
    ┌────────────────────────┐
    │   Component Cache      │
    │  (dynamicNodeTypes)    │
    │                        │
    │  Map<string, Component>│
    └────────────────────────┘
```

## 🧩 Plugin Configuration Resolution

```
For package "http-request":

1. Try: packages/http-request/.nflow.json
   ↓ (if not found)
   
2. Try: packages/http-request/http-request.nflow.json
   ↓ (if not found)
   
3. Try: packages/http-request/package.json → nflow field
   ↓ (if not found)
   
4. Return: null (plugin has no config)

If found: Normalize config (sort → order)
Then: Cache with key "packagesDir::filename"
```

## 🎨 Component Discovery Process

```
Server Scan (Build Time):
┌────────────────────────┐
│ packages/              │
│ ├── begin/             │
│ │   └── node/          │◄── Scan this
│ │       └── index.tsx  │◄── Load component
│ ├── http-request/      │
│ │   ├── node/          │◄── Scan this
│ │   └── form/          │◄── Scan this too
│ └── @flow/             │◄── Skip (internal)
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Inject into HTML       │
│ window.__NFLOW_*       │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Client reads from      │
│ window object          │
└────────────────────────┘
```

## 📊 Performance Optimizations

```
1. Lazy Loading
   ┌─────────────────┐
   │ Only require()  │
   │ when isNodeEnv()│
   └─────────────────┘

2. Caching
   ┌─────────────────┐
   │ Config cached   │
   │ Forms cached    │
   └─────────────────┘

3. Early Filtering
   ┌─────────────────┐
   │ Skip @ packages │
   │ Skip if no dir  │
   └─────────────────┘

4. Smart Resolution
   ┌─────────────────┐
   │ Check direct    │
   │ path first      │
   └─────────────────┘
```

## 🌐 Browser vs Server

```
┌──────────────────────────────────────────┐
│              Feature Matrix              │
├──────────────┬──────────┬────────────────┤
│ Function     │ Browser  │ Server         │
├──────────────┼──────────┼────────────────┤
│ Config Load  │ Stub ❌  │ Full ✓         │
│ Scan Pkgs    │ Stub ❌  │ Full ✓         │
│ Get Components│ Window ✓│ Scan ✓         │
│ Get Keys     │ Window ✓│ FS Scan ✓      │
│ Caching      │ No       │ Yes ✓          │
└──────────────┴──────────┴────────────────┘
```
