import path from 'path';
import fs from 'fs/promises';

const FLOWS_DIR = path.join(process.cwd(), 'flows');
const INDEX_FILE = path.join(FLOWS_DIR, 'index.json');

export class FlowStorageService {
  static async ensureDir() {
    try {
      await fs.access(FLOWS_DIR);
    } catch {
      await fs.mkdir(FLOWS_DIR, { recursive: true });
    }
    
    // Ensure index file exists
    try {
      await fs.access(INDEX_FILE);
    } catch {
      await fs.writeFile(INDEX_FILE, JSON.stringify([]), 'utf-8');
    }
  }

  private static async buildIndexFromFiles(): Promise<any[]> {
    const files = await fs.readdir(FLOWS_DIR);
    const flows = await Promise.all(
      files
        .filter(f => f.endsWith('.json') && f !== 'index.json')
        .map(async f => {
          try {
            const content = await fs.readFile(path.join(FLOWS_DIR, f), 'utf-8');
            const data = JSON.parse(content);
            return {
              id: data.id,
              name: data.name || f.replace('.json', ''),
              updatedAt: data.updatedAt || Date.now(),
              nodeCount: data.data?.nodes?.length || 0,
              edgeCount: data.data?.edges?.length || 0
            };
          } catch {
            return null;
          }
        })
    );
    const validFlows = flows.filter(Boolean);
    await this.writeIndex(validFlows);
    return validFlows;
  }

  private static async readIndex(): Promise<any[]> {
    try {
      const content = await fs.readFile(INDEX_FILE, 'utf-8');
      const idx = JSON.parse(content);
      if (!Array.isArray(idx) || idx.length === 0) {
        // If empty, try to rebuild just in case there are legacy files
        const files = await fs.readdir(FLOWS_DIR);
        if (files.filter(f => f.endsWith('.json') && f !== 'index.json').length > 0) {
           return await this.buildIndexFromFiles();
        }
      }
      return idx;
    } catch {
      return await this.buildIndexFromFiles();
    }
  }

  private static async writeIndex(flows: any[]) {
    await fs.writeFile(INDEX_FILE, JSON.stringify(flows, null, 2), 'utf-8');
  }

  static async listFlows() {
    await this.ensureDir();
    const flows = await this.readIndex();
    return flows.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static async getFlow(id: string) {
    await this.ensureDir();
    const filePath = path.join(FLOWS_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  static async saveFlow(flow: any) {
    await this.ensureDir();
    if (!flow.id) {
      throw new Error('Flow ID is required');
    }
    
    const filePath = path.join(FLOWS_DIR, `${flow.id}.json`);
    
    let existingFlow: any = null;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existingFlow = JSON.parse(content);
    } catch {
      // New flow
    }

    const timestamp = Date.now();
    const isAutoSave = !!flow.isAutoSave;

    if (existingFlow) {
      if (!isAutoSave) {
        // Only create new version if NOT an auto-save
        const newVersion = {
          id: `v-${timestamp}`,
          timestamp,
          data: flow.data,
          label: flow.versionLabel || `Version ${new Date(timestamp).toLocaleString()}`
        };
        const versions = existingFlow.versions || [];
        flow.versions = [newVersion, ...versions].slice(0, 50);
      } else {
        // Preserve existing versions during auto-save
        flow.versions = existingFlow.versions || [];
      }
    } else {
      // First save: always create a version
      const newVersion = {
        id: `v-${timestamp}`,
        timestamp,
        data: flow.data,
        label: flow.versionLabel || `Initial Version`
      };
      flow.versions = [newVersion];
    }

    flow.updatedAt = timestamp;
    delete flow.versionLabel;

    // Save full JSON payload
    await fs.writeFile(filePath, JSON.stringify(flow, null, 2), 'utf-8');
    
    // Update index
    const index = await this.readIndex();
    const existingIndexIdx = index.findIndex(f => f.id === flow.id);
    const metaInfo = {
      id: flow.id,
      name: flow.name || flow.id,
      updatedAt: timestamp,
      nodeCount: flow.data?.nodes?.length || 0,
      edgeCount: flow.data?.edges?.length || 0
    };
    
    if (existingIndexIdx >= 0) {
      index[existingIndexIdx] = metaInfo;
    } else {
      index.push(metaInfo);
    }
    
    await this.writeIndex(index);
    
    return flow.id;
  }

  static async deleteFlow(id: string) {
    await this.ensureDir();
    const filePath = path.join(FLOWS_DIR, `${id}.json`);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
    
    // Remove from index
    const index = await this.readIndex();
    const newIndex = index.filter(f => f.id !== id);
    await this.writeIndex(newIndex);
  }
}
