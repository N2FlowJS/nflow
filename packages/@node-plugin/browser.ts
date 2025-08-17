export * from './type';

// Browser stub: server-only plugin discovery is not available client-side.
export function getNodePluginConfig() { return {}; }
export function getPackageNodePluginConfig(_packageName: string) { return undefined; }
