const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, cb);
    else if (ent.isFile() && full.endsWith('.js')) cb(full);
  }
}

function fixImportsInFile(filePath) {
  let s = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  // match import ... from '...'; and export ... from '...'; and dynamic import('...')
  const re = /(\b(?:import|export)\b[\s\S]*?\bfrom\s+)(['"])(\.{1,2}\/[^'";]+)\2/gm;
  s = s.replace(re, (m, p1, q, rel) => {
    if (rel.match(/\.(js|json|css|mjs|cjs)$/)) return m; // already has extension
    const abs = path.resolve(dir, rel);
    if (fs.existsSync(abs + '.js')) return `${p1}${q}${rel}.js${q}`;
    if (fs.existsSync(path.join(abs, 'index.js'))) return `${p1}${q}${rel}/index.js${q}`;
    if (fs.existsSync(abs + '.cjs')) return `${p1}${q}${rel}.cjs${q}`;
    if (fs.existsSync(abs + '.mjs')) return `${p1}${q}${rel}.mjs${q}`;
    // fallback: leave unchanged
    return m;
  });

  // dynamic import('...')
  const re2 = /(import\s*\(\s*)(['"])(\.{1,2}\/[^'"\)]+)\2(\s*\))/gm;
  s = s.replace(re2, (m, p1, q, rel, p4) => {
    if (rel.match(/\.(js|json|css|mjs|cjs)$/)) return m;
    const abs = path.resolve(dir, rel);
    if (fs.existsSync(abs + '.js')) return `${p1}${q}${rel}.js${q}${p4}`;
    if (fs.existsSync(path.join(abs, 'index.js'))) return `${p1}${q}${rel}/index.js${q}${p4}`;
    if (fs.existsSync(abs + '.cjs')) return `${p1}${q}${rel}.cjs${q}${p4}`;
    if (fs.existsSync(abs + '.mjs')) return `${p1}${q}${rel}.mjs${q}${p4}`;
    return m;
  });

  fs.writeFileSync(filePath, s, 'utf8');
}

function main() {
  const dist = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(dist)) {
    console.error('dist directory not found, run tsc first');
    process.exit(1);
  }
  walk(dist, fixImportsInFile);
  console.log('postbuild: fixed imports in dist');
}

main();
