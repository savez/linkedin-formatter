// extension.js — aggiunte della sola estensione all'interfaccia della PWA.
// Nel popup mostra "Apri in una scheda": la bozza è in localStorage, condiviso
// tra popup e scheda (stessa origine dell'estensione), quindi passa da sola.
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('popup')) return;

  var seg = document.querySelector('header .seg');
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy ghost';
  btn.textContent = 'Apri in una scheda';
  btn.addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('app.html') });
    window.close();
  });
  // Pulsante e selettore della famiglia sulla stessa riga, a destra del titolo.
  var actions = document.createElement('div');
  actions.className = 'ext-actions';
  seg.parentNode.insertBefore(actions, seg);
  actions.appendChild(btn);
  actions.appendChild(seg);
})();
