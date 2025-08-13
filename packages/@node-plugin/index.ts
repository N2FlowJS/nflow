export * from './type'
import * as fs from 'fs'
import * as path from 'path'

export type NodePluginConfigMap = Record<string, unknown>

/**
 * Read .nflow.json config from each package under the monorepo's packages directory.
 * Returns an object keyed by package folder name.
 */
export const getNodePluginConfig = (options?: {
    /** A directory within the repo to start searching upward from (defaults to process.cwd()). */
    rootDir?: string
    /** Override the config filename to look for within each package (defaults to `.nflow.json`). */
    filename?: string
}): NodePluginConfigMap => {
    const rootDir = options?.rootDir ?? process.cwd()
    const filename = options?.filename ?? '.nflow.json'

    const packagesDir = findPackagesDir(rootDir)
    if (!packagesDir) return {}

    let entries: fs.Dirent[] = []
    try {
        entries = fs.readdirSync(packagesDir, { withFileTypes: true })
    } catch (_) {
        return {}
    }

    const result: NodePluginConfigMap = {}

    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const pkgName = entry.name
        const pkgPath = path.join(packagesDir, pkgName)

        const primaryPath = path.join(pkgPath, filename)
        const secondaryPath = path.join(pkgPath, `${pkgName}.nflow.json`)
        const configPath = fs.existsSync(primaryPath)
            ? primaryPath
            : fs.existsSync(secondaryPath)
                ? secondaryPath
                : null

        if (!configPath) continue

        try {
            const raw = fs.readFileSync(configPath, 'utf8')
            const json = JSON.parse(raw)
            result[pkgName] = json
        } catch (err) {
            // Skip invalid JSON but keep scanning; optionally log for diagnostics in dev
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[nflow] Failed to read ${configPath}:`, err)
            }
        }
    }

    return result
}

/** Get the parsed .nflow.json for a specific package (by folder name). */
export function getPackageNodePluginConfig(
    packageName: string,
    options?: { rootDir?: string; filename?: string }
): unknown | undefined {
    const all = getNodePluginConfig(options)
    return all[packageName]
}

function findPackagesDir(startDir: string): string | null {
    // Walk up from startDir to repo root, looking for a 'packages' folder
    let current = path.resolve(startDir)
    const { root } = path.parse(current)

    while (true) {
        const candidate = path.join(current, 'packages')
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
            return candidate
        }
        if (current === root) break
        current = path.dirname(current)
    }
    return null
}