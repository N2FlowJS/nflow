import { getNodePluginConfig } from '../packages/@node-plugin';

// This smoke test asserts that packages like 'webhook' and 'wechat' are discoverable
// and that their index exports include a NodePlugin under the conventional names.
// We don't import executeNode directly to keep this a fast check.

function hasPluginExport(pkgName: string): boolean {
  try {
    // Resolve the package index via absolute path from cwd
    const path = require('path');
    const abs = path.join(process.cwd(), 'packages', pkgName);
    const mod = require(abs);
    return !!(mod && (mod.plugin || mod.default));
  } catch {
    return false;
  }
}

describe('plugin loader smoke', () => {
  it('discovers packages in config map', () => {
    const map = getNodePluginConfig();
    expect(map).toBeTruthy();
    // At minimum internal ones exist
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it('webhook package exposes a plugin export', () => {
    expect(hasPluginExport('webhook')).toBe(true);
  });

  it('wechat package exposes a plugin export', () => {
    expect(hasPluginExport('wechat')).toBe(true);
  });
});
