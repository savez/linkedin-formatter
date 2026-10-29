# Installare le estensioni

Le estensioni non sono (ancora) sui negozi di Chrome e Firefox: si installano dai
file allegati a ogni [release](https://github.com/savez/linkedin-formatter/releases/latest).
Ci vogliono due minuti.

| File | Per |
|---|---|
| `linkedin-formatter-chrome.zip` | Chrome, Edge, Brave, Arc, Opera, Vivaldi |
| `linkedin-formatter-firefox.zip` | Firefox 142+, installazione temporanea |
| `linkedin-formatter-firefox.xpi` | Firefox 142+, installazione permanente (solo se presente nella release, vedi sotto) |
| `linkedin-formatter-pwa.zip` | Il sito statico della PWA, da pubblicare su un tuo hosting |

L'estensione chiede un solo permesso, `contextMenus`, per la voce *Formatta per
LinkedIn* del clic destro. Non legge le pagine che visiti e non fa richieste di rete.

---

## Chrome, Edge, Brave e altri browser Chromium

1. Scarica [`linkedin-formatter-chrome.zip`](https://github.com/savez/linkedin-formatter/releases/latest/download/linkedin-formatter-chrome.zip).
2. **Estrai lo zip** in una cartella che non cancellerai, ad esempio
   `Documenti/estensioni/linkedin-formatter`. Il browser carica i file da lì
   ogni volta: se sposti o cancelli la cartella, l'estensione smette di funzionare.
3. Apri la pagina delle estensioni:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
4. Attiva **Modalità sviluppatore** (interruttore in alto a destra; in Edge è nella barra a sinistra).
5. Clicca **Carica estensione non pacchettizzata** e seleziona la cartella estratta
   (quella che contiene `manifest.json`).
6. Clicca l'icona del puzzle 🧩 nella barra e fissa *Testo per LinkedIn* con la puntina.

> [!NOTE]
> All'avvio Chrome può mostrare l'avviso *"Disattiva le estensioni in modalità
> sviluppatore"*. È normale per le estensioni installate fuori dal Chrome Web
> Store: chiudilo senza disattivare.

**Aggiornare**: scarica il nuovo zip, sostituisci il contenuto della stessa cartella
e clicca ↻ (*Ricarica*) sulla scheda dell'estensione in `chrome://extensions`.
La bozza che stavi scrivendo resta.

---

## Firefox

Firefox installa in modo permanente solo le estensioni firmate da Mozilla. Ci sono due strade.

### A. File `.xpi` firmato (permanente)

Se la release contiene `linkedin-formatter-firefox.xpi`:

1. Aprilo **con Firefox**: trascinalo in una finestra o usa *File → Apri file*.
2. Conferma con **Aggiungi**.

Resta installata dopo il riavvio. Per aggiornare, apri il `.xpi` della release più recente.

### B. Zip come componente aggiuntivo temporaneo

1. Scarica [`linkedin-formatter-firefox.zip`](https://github.com/savez/linkedin-formatter/releases/latest/download/linkedin-formatter-firefox.zip). Non serve estrarlo.
2. Apri `about:debugging#/runtime/this-firefox`.
3. Clicca **Carica componente aggiuntivo temporaneo…** e seleziona lo zip.

L'estensione resta attiva **fino alla chiusura di Firefox**: al riavvio va
ricaricata. Va bene per provarla; per l'uso quotidiano serve il `.xpi`.

> Firefox Developer Edition e Nightly possono installare anche lo zip in modo
> permanente: imposta `xpinstall.signatures.required` a `false` in `about:config`,
> poi apri lo zip da `about:addons` → ⚙️ → *Installa componente aggiuntivo da file*.
> Nella versione normale di Firefox questa impostazione non ha effetto.

---

## Come si usa

- **Popup**: clicca l'icona nella barra. Scrivi a sinistra, copia a destra.
  *Apri in una scheda* sposta la bozza in una scheda intera, più comoda per i post lunghi.
- **Clic destro**: seleziona del testo in qualsiasi pagina → *Formatta per LinkedIn*.
  Si apre l'app con il testo già inserito.
- **Scorciatoie**: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>B</kbd>, <kbd>I</kbd>, <kbd>U</kbd> sulla selezione.

---

## Problemi frequenti

| Sintomo | Causa e soluzione |
|---|---|
| *"Manifest file is missing or unreadable"* | Hai selezionato la cartella sbagliata: scegli quella che contiene direttamente `manifest.json`, non quella che la contiene. |
| L'estensione è sparita dopo il riavvio di Firefox | Era temporanea (strada B): usa il `.xpi` firmato. |
| *"Questo componente aggiuntivo non è verificato"* in Firefox | Stai aprendo lo zip come se fosse un `.xpi`: usa `about:debugging` (strada B). |
| Su LinkedIn alcune lettere appaiono come quadratini | Il dispositivo di chi legge non ha un font con quei caratteri, capita su sistemi molto vecchi. Preferisci grassetto e corsivo sans, i più supportati. |
| Il clic destro non mostra *Formatta per LinkedIn* | La voce compare solo se hai selezionato del testo. |

Il problema non è in elenco? [Apri una issue](https://github.com/savez/linkedin-formatter/issues/new/choose).

---

## Compilare le estensioni da sorgente

```bash
git clone https://github.com/savez/linkedin-formatter.git
cd linkedin-formatter
npm run build
```

Trovi le estensioni non pacchettizzate in `dist/chrome` e `dist/firefox`, e gli zip in `dist/`.
