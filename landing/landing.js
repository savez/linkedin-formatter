// landing.js — prova dal vivo nell'hero. Usa lo stesso formatter.js della PWA (app/formatter.js).
(function () {
  'use strict';
  var F = window.LIFormat;
  var demo = document.getElementById('prova');
  if (!F) { demo.hidden = true; return; } // anteprima locale senza app/: niente demo

  var input = document.getElementById('demo-input');
  var output = document.getElementById('demo-output');
  var count = document.getElementById('demo-count');
  var copyBtn = document.getElementById('demo-copy');

  function render() {
    var out = F.fromMarkup(input.value);
    output.textContent = out;
    var c = F.count(out);
    count.textContent = Math.max(c.codePoints, c.utf16) + ' / ' + c.limit + ' caratteri';
  }

  copyBtn.addEventListener('click', function () {
    var text = output.textContent;
    var done = function () {
      copyBtn.textContent = 'Copiato';
      setTimeout(function () { copyBtn.textContent = 'Copia'; }, 1400);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () {});
  });

  input.addEventListener('input', render);
  render();
})();
