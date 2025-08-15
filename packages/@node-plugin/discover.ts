import * as fs from 'fs'
import * as path from 'path'
import { NodePlugin } from './type'

/**
 * Discover NodePlugin exports in the monorepo packages directory.
 * Convention: each package has index.ts re-exporting its <something>Plugin constant.
 * We attempt a dynamic require for built JS (dist) or TS source (ts-node/register scenario).
 */
export function discoverNodePlugins(options?: { rootDir?: string; packagesDir?: string }): NodePlugin[] {
  const rootDir = options?.rootDir ?? process.cwd()
  const packagesDir = options?.packagesDir || path.join(rootDir, 'packages')
  if (!fs.existsSync(packagesDir)) return []

  const plugins: NodePlugin[] = []
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = path.join(packagesDir, entry.name)

    // skip infrastructure/internal scoped dirs starting with @ (except @flow / @node-plugin / @template-processor)
    if (entry.name.startsWith('@')) continue

    const indexTs = path.join(dir, 'index.ts')
    const indexJs = path.join(dir, 'index.js')
    let mod: any = null
    try {
      if (fs.existsSync(indexJs)) mod = require(indexJs)
      else if (fs.existsSync(indexTs)) mod = require(indexTs)
      else continue
    } catch {
      continue
    }

    if (!mod) continue
    for (const k of Object.keys(mod)) {
      const val = (mod as any)[k]
      if (val && typeof val === 'object' && val.name && typeof val.match === 'function' && typeof val.run === 'function') {
        plugins.push(val as NodePlugin)
      }
    }
  }
  return plugins
}
