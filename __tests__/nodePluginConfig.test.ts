import * as fs from 'fs'
import * as path from 'path'
import { getNodePluginConfig, getPackageNodePluginConfig } from '../packages/@node-plugin'

// We'll spy on fs methods instead of replacing the module to avoid readonly prop issues

function dirent(name: string, isDir: boolean): fs.Dirent {
  return {
    name,
    isDirectory: () => isDir,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isFIFO: () => false,
    isFile: () => !isDir,
    isSocket: () => false,
    isSymbolicLink: () => false,
  } as unknown as fs.Dirent
}

describe('getNodePluginConfig', () => {
  const root = 'D:/repo'
  const packages = path.join(root, 'packages')

  beforeEach(() => {
    jest.restoreAllMocks()

    jest.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) => {
      const s = String(p)
      return s === packages ||
        s === path.join(packages, 'begin') ||
        s === path.join(packages, 'generate') ||
        s.endsWith('.nflow.json')
    })

    jest.spyOn(fs, 'statSync').mockImplementation((p: fs.PathLike) => ({
      isDirectory: () => String(p) === packages || String(p).startsWith(path.join(packages, 'begin')) || String(p).startsWith(path.join(packages, 'generate')),
    } as any))

    jest.spyOn(fs, 'readdirSync').mockImplementation(() => [
      dirent('begin', true),
      dirent('generate', true),
      dirent('README.md', false),
    ] as any)

    jest.spyOn(fs, 'readFileSync').mockImplementation((p: fs.PathOrFileDescriptor, options?: any) => {
      const s = String(p)
      if (s.endsWith(path.join('begin', '.nflow.json'))) {
        return JSON.stringify({ enabled: true, order: 1 }) as unknown as Buffer
      }
      if (s.endsWith(path.join('generate', 'generate.nflow.json'))) {
        return JSON.stringify({ enabled: false, order: 2 }) as unknown as Buffer
      }
      return '{}' as unknown as Buffer
    })
  })

  it('loads configs from each package', () => {
    const cfg = getNodePluginConfig({ rootDir: root })
    expect(cfg).toEqual({
      begin: { enabled: true, order: 1 },
      generate: { enabled: false, order: 2 },
    })
  })

  it('returns specific package config', () => {
    const cfg = getPackageNodePluginConfig('begin', { rootDir: root })
    expect(cfg).toEqual({ enabled: true, order: 1 })
  })
})
