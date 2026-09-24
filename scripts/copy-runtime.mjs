import { mkdir, copyFile } from 'node:fs/promises';
// Exact same locally hosted runtime in development and on GitHub Pages.
await mkdir('public/pyodide', { recursive: true });
for (const file of [
  'pyodide.mjs',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]) {
  await copyFile(`node_modules/pyodide/${file}`, `public/pyodide/${file}`);
}
