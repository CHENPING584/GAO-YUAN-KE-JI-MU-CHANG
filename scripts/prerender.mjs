import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prerenderRoutes } from '../src/prerenderRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js');

const template = await readFile(templatePath, 'utf8');
const { render } = await import(pathToFileURL(serverEntryPath).href);

for (const route of prerenderRoutes) {
  const appHtml = render(route);
  const html = template.replace('<!--app-html-->', appHtml);

  const outputPath =
    route === '/'
      ? templatePath
      : path.join(distDir, route.replace(/^\//, ''), 'index.html');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
}
