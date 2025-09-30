
export * from './type';

// Browser-friendly exports: expose UI discovery helpers instead of fs-based scanning
export {
	getDiscoveredNodeComponents,
	reloadDiscoveredNodeComponents,
	getDiscoveredNodeForms,
	reloadDiscoveredNodeForms,
	getClientNodeTypes,
	getClientNodeTypeKeys,
	getClientNODE_TYPES,
} from './discovery/ui-discover';

// Browser stub: server-only plugin discovery not available client-side.
export function getNodePluginConfig(): Record<string, unknown> { return {}; }
export function getPackageNodePluginConfig(_packageName: string): undefined { return undefined; }

// Client-safe dynamic keys using UI registry
export function getDynamicNodeTypeKeys(): string[] {
	try {
		// Use dynamic import for browser compatibility
				type WindowWithNodeTypeKeys = Window & { getClientNodeTypeKeys?: () => string[] };
				const win = window as WindowWithNodeTypeKeys;
				return (typeof window !== 'undefined' && win.getClientNodeTypeKeys)
					? win.getClientNodeTypeKeys()
					: [];
	} catch {
		return [];
	}
}

export function getAllNodeTypeKeys(): string[] {
	return getDynamicNodeTypeKeys();
}

export function invalidateNodePluginConfigCache(): void {/* noop in browser */}
