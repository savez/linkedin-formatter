import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const F = createRequire(import.meta.url)('../src/formatter.js');

test('grassetto e corsivo in sans (default) e serif', () => {
  assert.equal(F.fromMarkup('Ciao **mondo**'), 'Ciao 𝗺𝗼𝗻𝗱𝗼');
  assert.equal(F.fromMarkup('*ciao*'), '𝘤𝘪𝘢𝘰');
  assert.equal(F.fromMarkup('**ciao**', { family: 'serif' }), '𝐜𝐢𝐚𝐨');
  assert.equal(F.fromMarkup('***ok***'), '𝙤𝙠');
});

test('sottolineato, barrato e monospazio', () => {
  assert.equal(F.fromMarkup('++ab++'), 'a̲b̲');
  assert.equal(F.fromMarkup('~~ab~~'), 'a̶b̶');
  assert.equal(F.fromMarkup('`ab`'), '𝚊𝚋');
});

test('markup di riga: titolo, elenchi, checklist, citazione, divisore', () => {
  assert.equal(F.fromMarkup('# Ciao'), '𝗖𝗶𝗮𝗼');
  assert.equal(F.fromMarkup('- uno\n- due'), '• uno\n• due');
  assert.equal(F.fromMarkup('- [ ] da fare\n- [x] fatto'), '⬜ da fare\n✅ fatto');
  assert.equal(F.fromMarkup('> ok'), '▍𝘰𝘬');
  assert.equal(F.fromMarkup('---'), '━━━━━━━━━━');
});

test('URL, #hashtag e @menzioni restano cliccabili anche dentro il grassetto', () => {
  const out = F.fromMarkup('**vedi https://example.com #tag @mario**');
  assert.ok(out.includes('https://example.com'));
  assert.ok(out.includes('#tag'));
  assert.ok(out.includes('@mario'));
  assert.ok(out.startsWith('𝘃𝗲𝗱𝗶'));
});

test('lettere accentate: base trasformata, accento combinante', () => {
  assert.equal(F.fromMarkup('**è**'), '𝗲̀');
});

test('underscore dentro le parole non diventa corsivo', () => {
  assert.equal(F.fromMarkup('nome_file_finale'), 'nome_file_finale');
});

test('applyStyle copre tutti gli stili dichiarati', () => {
  for (const { id } of F.STYLES) assert.equal(typeof F.applyStyle('Testo 123', id), 'string', id);
  assert.equal(F.applyStyle('Hello', 'script'), 'ℋℯ𝓁𝓁ℴ');
  assert.equal(F.applyStyle('AB', 'fullwidth'), 'ＡＢ');
  assert.equal(F.applyStyle('b\na', 'sortAsc'), 'a\nb');
  assert.equal(F.applyStyle('uno\ndue', 'numbered'), '1. uno\n2. due');
  assert.throws(() => F.applyStyle('x', 'inesistente'));
});

test('toPlain riporta a testo semplice', () => {
  const src = 'Ciao **mondo** ++sotto++ è `x1`';
  assert.equal(F.toPlain(F.fromMarkup(src)), 'Ciao mondo sotto è x1');
  assert.equal(F.toPlain('ＡＢ'), 'AB');
});

test('count riporta code point e unità UTF-16', () => {
  assert.deepEqual(F.count('𝗮b'), { codePoints: 2, utf16: 3, limit: 3000 });
});
