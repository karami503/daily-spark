import { mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await build({ entryPoints: ['app.js'], bundle: true, minify: true, format: 'esm', outfile: 'dist/app.js' });
execFileSync('node_modules/.bin/tailwindcss', ['-i', 'style.css', '-o', 'dist/style.css', '--minify'], { stdio: 'inherit' });
