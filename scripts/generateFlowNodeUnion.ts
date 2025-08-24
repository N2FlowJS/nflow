/**
 * Auto-generates models/generated-flow-node-union.ts by scanning each packages/<pkg>/types.ts
 * for exported type names ending with `NodeData`.
 * This avoids manual maintenance of the FlowNode union.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const OUTPUT_FILE = path.join(ROOT, 'models', 'generated-flow-node-union.ts');

interface NodeDataDef { name: string; pkg: string; }

function findNodeDataTypes(): NodeDataDef[] {
  const results: NodeDataDef[] = [];
  const packages = fs.readdirSync(PACKAGES_DIR)
    .filter(p => !p.startsWith('.') && fs.statSync(path.join(PACKAGES_DIR, p)).isDirectory())
    // Prefer dashed names; exclude legacy duplicates (e.g. 'httprequest' when 'http-request' exists)
    .filter(p => {
      if (p === 'httprequest' && fs.existsSync(path.join(PACKAGES_DIR, 'http-request'))) return false;
      if (p === 'google-map' && fs.existsSync(path.join(PACKAGES_DIR, 'googlemap'))) return false;
      return true;
    });
  const typeRegex = /export\s+type\s+(\w+NodeData)\b/g; // capture exported NodeData types
  for (const pkg of packages) {
    const typesFile = path.join(PACKAGES_DIR, pkg, 'types.ts');
    if (!fs.existsSync(typesFile)) continue;
    const content = fs.readFileSync(typesFile, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = typeRegex.exec(content))) {
      results.push({ name: match[1], pkg });
    }
  }
  return results;
}

function generate() {
  const defs = findNodeDataTypes();
  if (defs.length === 0) {
    console.error('No *NodeData types found.');
    process.exit(1);
  }
  const byName = new Map<string, NodeDataDef>();
  defs.forEach(d => byName.set(d.name, d));
  const unique = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));

  const importLines = unique.map(d => `import type { ${d.name} } from '../packages/${d.pkg}/types';`).join('\n');
  const union = unique.map(d => d.name).join('\n  | ');

  const header = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Run: npm run generate:flow-node-union\n`;
  const body = `${header}import { Node } from '@xyflow/react';\n${importLines}\n\nexport type AllNodeData =\n  | ${union};\n\nexport type FlowNode = Node<AllNodeData>;\n`;
  fs.writeFileSync(OUTPUT_FILE, body, 'utf8');
  console.log(`Generated ${OUTPUT_FILE} with ${unique.length} node data types.`);
}

generate();
