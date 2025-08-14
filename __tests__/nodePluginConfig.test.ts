import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { getNodePluginConfig, getPackageNodePluginConfig } from '../packages/@node-plugin'

describe('getNodePluginConfig', () => {
  let tmpRoot: string
  let packagesDir: string

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nflow-test-'))
    packagesDir = path.join(tmpRoot, 'packages')
    fs.mkdirSync(packagesDir)

    const beginDir = path.join(packagesDir, 'begin')
    fs.mkdirSync(beginDir)
    fs.writeFileSync(path.join(beginDir, '.nflow.json'), JSON.stringify({ enabled: true, order: 1 }), 'utf8')

    const generateDir = path.join(packagesDir, 'generate')
    fs.mkdirSync(generateDir)
    fs.writeFileSync(path.join(generateDir, 'generate.nflow.json'), JSON.stringify({ enabled: false, order: 20 }), 'utf8')
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('loads configs from each package (primary + secondary naming)', () => {
    const cfg = getNodePluginConfig({ rootDir: tmpRoot })
    expect(cfg).toEqual({
      begin: { enabled: true, order: 1 },
      generate: { enabled: false, order: 20 },
    })
  })

  it('returns specific package config', () => {
    const beginCfg = getPackageNodePluginConfig('begin', { rootDir: tmpRoot })
    expect(beginCfg).toEqual({ enabled: true, order: 1 })
  })

  it('maps legacy sort field to order when order absent', () => {
    const legacyDir = path.join(packagesDir, 'legacy')
    fs.mkdirSync(legacyDir)
    fs.writeFileSync(path.join(legacyDir, '.nflow.json'), JSON.stringify({ enabled: true, sort: 7 }), 'utf8')
    const cfg = getNodePluginConfig({ rootDir: tmpRoot })
    expect(cfg.legacy).toEqual({ enabled: true, sort: 7, order: 7 })
  })
})
