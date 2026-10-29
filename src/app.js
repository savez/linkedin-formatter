// app.js — interfaccia della PWA (e del popup delle estensioni). Logica di formattazione in formatter.js.
(function () {
  'use strict';
  var F = window.LIFormat;
  var $ = function (id) { return document.getElementById(id); };
  var input = $('input'), output = $('output'), countEl = $('count'), rows = $('rows');
  var family = 'sans';
  var DRAFT_KEY = 'li-format:draft', FAMILY_KEY = 'li-format:family';
  var SAMPLE = 'Il tuo testo qui';

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // Righe del campionario
  F.STYLES.forEach(function (s) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="name"></span><span class="sample"></span><button type="button" class="copy ghost">Copia</button>';
    li.querySelector('.name').textContent = s.label;
    li.querySelector('button').addEventListener('click', function (ev) {
      copy(F.applyStyle(F.stripMarkup(input.value) || SAMPLE, s.id), ev.currentTarget);
    });
    li.dataset.style = s.id;
    rows.appendChild(li);
  });

  function render() {
    var src = input.value;
    var out = F.fromMarkup(src, { family: family });
    output.textContent = out;
    var c = F.count(out);
    var n = Math.max(c.codePoints, c.utf16);
    countEl.textContent = (c.codePoints === c.utf16 ? c.codePoints : c.codePoints + '–' + c.utf16) + ' / ' + c.limit;
    countEl.title = 'Caratteri: ' + c.codePoints + ' (unità UTF-16: ' + c.utf16 + '). Non è documentato quale dei due conti LinkedIn.';
    countEl.classList.toggle('over', n > c.limit);
    var sample = F.stripMarkup(src) || SAMPLE;
    rows.querySelectorAll('li').forEach(function (li) {
      li.querySelector('.sample').textContent = F.applyStyle(sample, li.dataset.style);
    });
    store(DRAFT_KEY, src);
  }

  var toastTimer;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  function copy(text, btn) {
    var done = function () {
      if (btn) {
        var old = btn.textContent; btn.textContent = 'Copiato'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1400);
      }
      toast('Testo copiato');
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text) && done(); });
    } else if (fallbackCopy(text)) done();
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (!ok) toast('Copia non riuscita: seleziona il testo a mano');
    return ok;
  }

  // Toolbar: avvolge la selezione con i marcatori (o li inserisce vuoti)
  function wrapSelection(mark) {
    var s = input.selectionStart, e = input.selectionEnd, v = input.value;
    var sel = v.slice(s, e);
    var lead = sel.match(/^\s*/)[0], trail = sel.match(/\s*$/)[0];
    var core = sel.slice(lead.length, sel.length - trail.length);
    var before = v.slice(0, s + lead.length), after = v.slice(e - trail.length);
    if (core && before.endsWith(mark) && after.startsWith(mark)) {
      input.setRangeText(core, s + lead.length - mark.length, e - trail.length + mark.length, 'select');
    } else {
      input.setRangeText(lead + mark + core + mark + trail, s, e, 'select');
      if (!core) { var p = s + mark.length; input.setSelectionRange(p, p); }
      else input.setSelectionRange(s + lead.length + mark.length, s + lead.length + mark.length + core.length);
    }
    input.focus(); render();
  }
  function prefixLines(prefix) {
    var v = input.value, s = input.selectionStart, e = input.selectionEnd;
    var ls = v.lastIndexOf('\n', s - 1) + 1;
    var le = v.indexOf('\n', e); if (le === -1) le = v.length;
    var block = v.slice(ls, le).split('\n').map(function (l) {
      return l.startsWith(prefix) ? l.slice(prefix.length) : prefix + l;
    }).join('\n');
    input.setRangeText(block, ls, le, 'select'); input.focus(); render();
  }
  document.querySelectorAll('[data-wrap]').forEach(function (b) {
    b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    b.addEventListener('click', function () { wrapSelection(b.dataset.wrap); });
  });
  document.querySelectorAll('[data-prefix]').forEach(function (b) {
    b.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    b.addEventListener('click', function () { prefixLines(b.dataset.prefix); });
  });
  input.addEventListener('keydown', function (ev) {
    if (!(ev.ctrlKey || ev.metaKey) || ev.altKey) return;
    var map = { b: '**', i: '*', u: '++' };
    var k = ev.key.toLowerCase();
    if (map[k]) { ev.preventDefault(); wrapSelection(map[k]); }
  });

  document.querySelectorAll('[data-family]').forEach(function (b) {
    b.addEventListener('click', function () { setFamily(b.dataset.family); });
  });
  function setFamily(f) {
    family = f === 'serif' ? 'serif' : 'sans';
    document.querySelectorAll('[data-family]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.family === family));
    });
    store(FAMILY_KEY, family); render();
  }

  $('copy-main').addEventListener('click', function (ev) {
    if (!output.textContent) { toast('Scrivi qualcosa prima di copiare'); return; }
    copy(output.textContent, ev.currentTarget);
  });
  $('clear').addEventListener('click', function () { input.value = ''; render(); input.focus(); });
  $('to-plain').addEventListener('click', function () { input.value = F.toPlain(input.value); render(); });
  input.addEventListener('input', render);

  // Precompilazione: #text=… (preferito, non va al server) oppure ?text=… (Web Share Target)
  function incoming() {
    var h = new URLSearchParams(location.hash.slice(1));
    var q = new URLSearchParams(location.search);
    var parts = [h.get('text') || q.get('text'), q.get('title'), q.get('url')]
      .filter(function (x) { return x; });
    if (!parts.length) return null;
    history.replaceState(null, '', location.pathname);
    return parts.join('\n\n');
  }

  var shared = incoming();
  input.value = shared !== null ? shared : (load(DRAFT_KEY) || '');
  setFamily(load(FAMILY_KEY) || 'sans');

  // Solo su http(s): nelle estensioni (chrome-extension://, moz-extension://) il service worker non serve.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
