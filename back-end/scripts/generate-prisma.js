#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');
// Load .env from back-end
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('PRISMA-GEN: DATABASE_URL set:', !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.error('PRISMA-GEN: DATABASE_URL not set in .env');
  process.exit(1);
}
const cwd = path.resolve(__dirname, '..');
const res = spawnSync('npx', ['prisma', 'generate', '--config', 'prisma.config.ts'], { stdio: 'inherit', cwd });
process.exit(res.status);
