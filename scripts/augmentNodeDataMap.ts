import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

const TYPE_REGEX = /export\s+type\s+(\w+NodeData)\s*=\s*BaseNodeData<[^>]*>\s*&\s*{[\s\S]*?type:\s*'([^']+)'/m;

let augmented = 0;
const pkgs = fs.readdirSync(PACKAGES_DIR).filter(d => fs.statSync(path.join(PACKAGES_DIR, d)).isDirectory());
for (const pkg of pkgs) {
  const file = path.join(PACKAGES_DIR, pkg, 'types.ts');
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("declare module '../../models/nodeDataMap'")) continue; // already augmented
  const match = content.match(TYPE_REGEX);
  if (!match) continue;
  const alias = match[1];
  // const literal = match[2]; // not used as property (may contain hyphen)
  content += `\n\n// Auto-added augmentation for NodeDataMap\ndeclare module '../../models/nodeDataMap' {\n  interface NodeDataMap {\n    ${alias}: ${alias};\n  }\n}\n`;
  fs.writeFileSync(file, content, 'utf8');
  augmented++;
}
console.log(`Augmented ${augmented} node data type files.`);
