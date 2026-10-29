#!/usr/bin/env node
// build.mjs — genera dalla PWA in src/ tre artefatti, senza dipendenze npm:
//
//   dist/pwa/      sito statico da pubblicare (service worker con la versione corrente)
//   dist/chrome/   estensione Manifest V3 per Chrome/Edge/Brave
//   dist/firefox/  estensione Manifest V3 per Firefox
//   dist/linkedin-formatter-{pwa,chrome,firefox}.zip
//
// La versione arriva da package.json, che release-please aggiorna a ogni rilascio.
// Uso: node scripts/build.mjs [--no-zip]

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const EXT = join(ROOT, 'extension');
const DIST = join(ROOT, 'dist');
const NAME = 'linkedin-formatter';

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;
// manifest.json accetta solo 1-4 interi separati da punti: niente "-beta.1".
const extVersion = version.split(/[-+]/)[0];

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };

function replaceOnce(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error(`build: "${label}" non trovato`);
  return text.replace(search, replacement);
}

rmSync(DIST, { recursive: true, force: true });

// --- PWA -------------------------------------------------------------------
const pwa = join(DIST, 'pwa');
cpSync(SRC, pwa, { recursive: true });
write(join(pwa, 'sw.js'), replaceOnce(read(join(SRC, 'sw.js')), '__VERSION__', `v${version}`, 'segnaposto VERSION in sw.js'));

// --- Estensioni ------------------------------------------------------------
// Pagina dell'estensione = index.html senza manifest PWA, più CSS/JS dell'estensione.
function extensionPage(popup) {
  let html = read(join(SRC, 'index.html'));
  html = replaceOnce(html, '<link rel="manifest" href="manifest.webmanifest">\n', '', 'link al manifest');
  html = replaceOnce(html, '</head>', '<link rel="stylesheet" href="extension.css">\n</head>', '</head>');
  html = replaceOnce(html, '<script src="app.js"></script>', '<script src="app.js"></script>\n<script src="extension.js"></script>', 'script app.js');
  if (popup) html = replaceOnce(html, '<html lang="it">', '<html lang="it" class="popup">', '<html>');
  return html;
}

const icons = { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' };

const baseManifest = {
  manifest_version: 3,
  name: 'Testo per LinkedIn',
  short_name: 'Testo LinkedIn',
  version: extVersion,
  description: 'Formatta i post LinkedIn con grassetto, corsivo, sottolineato ed elenchi in Unicode. Tutto in locale, nessun dato inviato.',
  homepage_url: 'https://github.com/savez/linkedin-formatter',
  icons,
  action: { default_title: 'Testo per LinkedIn', default_popup: 'popup.html', default_icon: icons },
  permissions: ['contextMenus']
};

const targets = {
  chrome: {
    ...baseManifest,
    background: { service_worker: 'background.js' }
  },
  firefox: {
    ...baseManifest,
    background: { scripts: ['background.js'] },
    browser_specific_settings: {
      gecko: {
        id: 'linkedin-formatter@smzstudio.it',
        strict_min_version: '142.0',
        data_collection_permissions: { required: ['none'] }
      }
    }
  }
};

for (const [target, manifest] of Object.entries(targets)) {
  const out = join(DIST, target);
  for (const f of ['formatter.js', 'app.js']) cpSync(join(SRC, f), join(out, f));
  cpSync(join(SRC, 'icons'), join(out, 'icons'), { recursive: true });
  for (const f of ['background.js', 'extension.js', 'extension.css']) cpSync(join(EXT, f), join(out, f));
  cpSync(join(EXT, 'icons'), join(out, 'icons'), { recursive: true });
  write(join(out, 'app.html'), extensionPage(false));
  write(join(out, 'popup.html'), extensionPage(true));
  write(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

// --- Zip -------------------------------------------------------------------
if (!process.argv.includes('--no-zip')) {
  for (const target of ['pwa', 'chrome', 'firefox']) {
    // -X: niente attributi extra; i file stanno alla radice dello zip, come vuole AMO.
    execFileSync('zip', ['-qrX', join(DIST, `${NAME}-${target}.zip`), '.'], { cwd: join(DIST, target) });
  }
}

console.log(`build ${version} (estensioni ${extVersion}) → dist/`);
