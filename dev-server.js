#!/usr/bin/env node

/**
 * Dev Server Wrapper
 * Cross-platform wrapper to start Vite dev server, fixing module resolution issues
 * on Windows where npm scripts may fail to resolve node_modules/.bin/vite
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the path to Vite's binary
const viteBin = resolve(__dirname, 'node_modules/vite/bin/vite.js');

// Pass through all command line arguments
const args = process.argv.slice(2);

// Spawn Vite with the arguments
const child = spawn('node', [viteBin, ...args], {
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Dev server exited with code ${code}`);
    process.exit(code);
  }
});
