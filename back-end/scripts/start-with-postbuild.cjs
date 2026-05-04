#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

function run() {
  const scriptDir = __dirname;
  const postbuildPath = path.join(scriptDir, 'postbuild.cjs');
  const distIndex = path.join(scriptDir, '..', 'dist', 'index.js');

  const post = spawn(process.execPath, [postbuildPath], { stdio: 'inherit' });
  post.on('error', (err) => {
    console.error('Failed to run postbuild:', err);
    process.exit(1);
  });
  post.on('exit', (code) => {
    if (code !== 0) {
      console.error('postbuild exited with code', code);
      process.exit(code);
    }

    const child = spawn(process.execPath, ['--enable-source-maps', distIndex], { stdio: 'inherit' });
    const forwardSignal = (sig) => {
      try { child.kill(sig); } catch (e) {}
    };
    process.on('SIGINT', forwardSignal);
    process.on('SIGTERM', forwardSignal);
    child.on('exit', (c) => process.exit(c));
  });
}

run();
