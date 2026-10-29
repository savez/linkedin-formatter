// background.js — menu contestuale "Formatta per LinkedIn" sul testo selezionato.
// Apre l'app in una scheda già compilata tramite #text=… (lo stesso meccanismo della PWA).
// Chrome lo esegue come service worker, Firefox come event page: usa solo API comuni.

var MENU_ID = 'li-format-selection';

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Formatta per LinkedIn',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  chrome.tabs.create({
    url: chrome.runtime.getURL('app.html') + '#text=' + encodeURIComponent(info.selectionText)
  });
});
